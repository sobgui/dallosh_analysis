"""Celery tasks for dataset processing."""
import sys
import os
import pandas as pd
from datetime import datetime
from typing import Dict, Optional

# Add src to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.celery_app import celery_app
from src.configs.constants import (
    TASK_STATUS_ADDED,
    TASK_STATUS_IN_QUEUE, TASK_STATUS_READING_DATASET,
    TASK_STATUS_READING_DATASET_DONE,
    TASK_STATUS_PROCESS_CLEANING, TASK_STATUS_PROCESS_CLEANING_DONE,
    TASK_STATUS_SENDING_TO_LLM, TASK_STATUS_SENDING_TO_LLM_PROGRESS,
    TASK_STATUS_SENDING_TO_LLM_DONE,
    TASK_STATUS_APPENDING_COLUMNS, TASK_STATUS_APPENDING_COLUMNS_DONE,
    TASK_STATUS_SAVING_FILE, TASK_STATUS_SAVING_FILE_DONE,
    TASK_STATUS_DONE, TASK_STATUS_ON_ERROR
)
from src.services import (
    reading_file, cleaning, calling_llm,
    appending_columns, saving
)
from src.lib.database.service import DatabaseService
from src.configs.env import (
    DB_TYPE, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
)
from src.utils.logger import setup_logger

# Setup logger for processor tasks
task_logger = setup_logger('processor', 'worker.log')


_db_service_cache = None

def get_db_adapter():
    """Get database adapter instance (cached for Celery tasks).
    
    Ensures the database connection is alive and reconnects if necessary.
    This is important for Celery workers where connections might timeout.
    """
    global _db_service_cache
    
    if _db_service_cache is None:
        db_configs = {
            'type': DB_TYPE,
            'host': DB_HOST,
            'port': DB_PORT,
            'dbname': DB_NAME,
            'auth': {
                'username': DB_USER,
                'password': DB_PASSWORD
            } if DB_USER and DB_PASSWORD else None
        }
        
        _db_service_cache = DatabaseService(db_configs)
        _db_service_cache.connect()
    
    # Get adapter and ensure it's connected (will auto-reconnect if needed)
    adapter = _db_service_cache.get_adapter()
    if hasattr(adapter, 'ensure_connected'):
        try:
            adapter.ensure_connected()
        except Exception as e:
            task_logger.warning(f"Database connection check failed, reconnecting: {e}")
            try:
                _db_service_cache.disconnect()
            except:
                pass
            _db_service_cache.connect()
    
    return adapter


def emit_event(file_id: str, event: str, db_adapter=None, payload: Optional[Dict] = None):
    """Emit event to RabbitMQ for frontend to listen."""
    try:
        import pika
        import json
        from src.configs.env import RABBITMQ_URL, RABBITMQ_TOPIC_TASKS
        
        connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
        channel = connection.channel()
        
        # Declare exchange before publishing
        channel.exchange_declare(
            exchange=RABBITMQ_TOPIC_TASKS,
            exchange_type='topic',
            durable=True
        )
        
        message_payload = {'file_id': file_id, 'event': event}
        if payload:
            # Avoid overriding mandatory keys
            message_payload.update({k: v for k, v in payload.items() if k not in {'file_id', 'event'}})

        message = json.dumps(message_payload)
        # Routing key format: {fileId}.{event} to match frontend subscription pattern
        # Frontend subscribes to: /exchange/tasks/{fileId}.*
        routing_key = f"{file_id}.{event}"
        channel.basic_publish(
            exchange=RABBITMQ_TOPIC_TASKS,
            routing_key=routing_key,
            body=message,
            properties=pika.BasicProperties(delivery_mode=2)
        )
        
        connection.close()
        if payload:
            task_logger.info(f"Emitted event: {event} for file_id: {file_id} | payload: {payload}")
        else:
            task_logger.info(f"Emitted event: {event} for file_id: {file_id}")
    except Exception as e:
        task_logger.error(f"Error emitting event: {e}", exc_info=True)


def update_task_status(file_id: str, status: str, db_adapter=None):
    """Update task status in database."""
    try:
        if db_adapter is None:
            db_adapter = get_db_adapter()
        
        task = db_adapter.find_one('tasks', {'data.file_id': file_id})
        if task:
            db_adapter.update_one(
                'tasks',
                {'data.file_id': file_id},
                {
                    'data.status': status,
                    'updatedAt': datetime.utcnow(),
                    'updatedBy': 'system'
                }
            )
    except Exception as e:
        task_logger.error(f"Error updating task status: {e}", exc_info=True)


@celery_app.task(bind=True, name='src.tasks.processor.process_dataset')
def process_dataset(self, file_id: str, file_path: str, ai_config: dict, last_step: str = None):
    """
    Process dataset through the pipeline.
    
    Args:
        file_id: File identifier
        file_path: Path to the dataset file
        ai_config: AI configuration dictionary
        last_step: Last step to resume from (optional)
    """
    db_adapter = None
    df = None
    
    try:
        task_logger.info(f"Starting task processing for file_id: {file_id}, file_path: {file_path}, last_step: {last_step}")
        
        # Get database adapter
        db_adapter = get_db_adapter()

        def event_emitter(fid: str, evt: str, payload: Optional[Dict] = None):
            emit_event(fid, evt, payload=payload)
        
        # Determine starting point
        if not last_step or last_step == TASK_STATUS_IN_QUEUE or last_step == TASK_STATUS_ADDED:
            last_step = TASK_STATUS_IN_QUEUE
        
        step_aliases = {
            TASK_STATUS_READING_DATASET_DONE: TASK_STATUS_PROCESS_CLEANING,
            TASK_STATUS_PROCESS_CLEANING_DONE: TASK_STATUS_SENDING_TO_LLM,
            TASK_STATUS_SENDING_TO_LLM_PROGRESS: TASK_STATUS_SENDING_TO_LLM,
            TASK_STATUS_SENDING_TO_LLM_DONE: TASK_STATUS_APPENDING_COLUMNS,
            TASK_STATUS_APPENDING_COLUMNS_DONE: TASK_STATUS_SAVING_FILE,
            TASK_STATUS_SAVING_FILE_DONE: TASK_STATUS_DONE,
        }
        if last_step in step_aliases:
            last_step = step_aliases[last_step]

        # Emit event and update status for the starting step
        # Services will emit their own events (reading_dataset, reading_dataset_done, etc.)
        # We only emit the initial step event here
        event_emitter(file_id, last_step)
        update_task_status(file_id, last_step, db_adapter)
        task_logger.info(f"Task {file_id} starting from step: {last_step}")
        
        # Process pipeline based on last_step
        if last_step == TASK_STATUS_IN_QUEUE:
            # Start from beginning
            # Services emit their own events (reading_dataset -> reading_dataset_done, etc.)
            # We only update database status to reflect current state
            task_logger.info(f"Task {file_id}: Step 1 - Reading dataset")
            file_id, df = reading_file(file_path, event_emitter)
            # reading_file emits reading_dataset and reading_dataset_done events
            # Update DB to reflect completion of reading_dataset step
            update_task_status(file_id, TASK_STATUS_READING_DATASET_DONE, db_adapter)
            
            task_logger.info(f"Task {file_id}: Step 2 - Cleaning dataset")
            df = cleaning(file_id, df, event_emitter, db_adapter)
            # cleaning emits process_cleaning and process_cleaning_done events
            # Update DB to reflect completion of cleaning step
            update_task_status(file_id, TASK_STATUS_PROCESS_CLEANING_DONE, db_adapter)
            
            task_logger.info(f"Task {file_id}: Step 3 - Calling LLM")
            df, _ = calling_llm(file_id, df, ai_config, event_emitter)
            # calling_llm emits sending_to_llm, sending_to_llm_progression, and sending_to_llm_done events
            # Update DB to reflect completion of LLM step
            update_task_status(file_id, TASK_STATUS_SENDING_TO_LLM_DONE, db_adapter)
            
            task_logger.info(f"Task {file_id}: Step 4 - Appending columns")
            appending_columns(file_id, event_emitter)
            # appending_columns emits appending_collumns and appending_collumns_done events
            # Update DB to reflect completion of appending columns step
            update_task_status(file_id, TASK_STATUS_APPENDING_COLUMNS_DONE, db_adapter)
            
            task_logger.info(f"Task {file_id}: Step 5 - Saving file")
            saving(file_id, df, event_emitter, db_adapter)
            # saving emits saving_file, saving_file_done, and done events
            # Update DB to reflect completion (done event is already emitted by saving service)
            update_task_status(file_id, TASK_STATUS_DONE, db_adapter)
            
        elif last_step == TASK_STATUS_READING_DATASET:
            # Resume from cleaning - services emit their own events
            file_id, df = reading_file(file_path, event_emitter)
            update_task_status(file_id, TASK_STATUS_READING_DATASET_DONE, db_adapter)
            
            df = cleaning(file_id, df, event_emitter, db_adapter)
            update_task_status(file_id, TASK_STATUS_PROCESS_CLEANING_DONE, db_adapter)
            
            df, _ = calling_llm(file_id, df, ai_config, event_emitter)
            update_task_status(file_id, TASK_STATUS_SENDING_TO_LLM_DONE, db_adapter)
            
            appending_columns(file_id, event_emitter)
            update_task_status(file_id, TASK_STATUS_APPENDING_COLUMNS_DONE, db_adapter)
            
            saving(file_id, df, event_emitter, db_adapter)
            update_task_status(file_id, TASK_STATUS_DONE, db_adapter)
            
        elif last_step == TASK_STATUS_PROCESS_CLEANING:
            # Resume from LLM - need to read cleaned file
            # If cleaned file exists, cleaning was already done, so continue from LLM
            # Services emit their own events, we just update DB status
            from src.configs.env import STORAGE_CLEANED
            cleaned_path = os.path.join(STORAGE_CLEANED, f"{file_id}.csv")
            if os.path.exists(cleaned_path):
                # Cleaning already done, continue from LLM
                # calling_llm will emit sending_to_llm event, so we don't need to emit it here
                df = pd.read_csv(cleaned_path)
            else:
                # Need to redo cleaning
                file_id, df = reading_file(file_path, event_emitter)
                update_task_status(file_id, TASK_STATUS_READING_DATASET_DONE, db_adapter)
                df = cleaning(file_id, df, event_emitter, db_adapter)
                update_task_status(file_id, TASK_STATUS_PROCESS_CLEANING_DONE, db_adapter)
            
            # calling_llm emits sending_to_llm, sending_to_llm_progression, and sending_to_llm_done events
            df, _ = calling_llm(file_id, df, ai_config, event_emitter)
            update_task_status(file_id, TASK_STATUS_SENDING_TO_LLM_DONE, db_adapter)
            
            # appending_columns emits appending_collumns and appending_collumns_done events
            appending_columns(file_id, event_emitter)
            update_task_status(file_id, TASK_STATUS_APPENDING_COLUMNS_DONE, db_adapter)
            
            # saving emits saving_file, saving_file_done, and done events
            saving(file_id, df, event_emitter, db_adapter)
            update_task_status(file_id, TASK_STATUS_DONE, db_adapter)
            
        elif last_step == TASK_STATUS_SENDING_TO_LLM:
            # Resume from LLM - need to read cleaned file
            # Services emit their own events, we just update DB status
            from src.configs.env import STORAGE_CLEANED
            cleaned_path = os.path.join(STORAGE_CLEANED, f"{file_id}.csv")
            if os.path.exists(cleaned_path):
                # Cleaning already done, continue from LLM
                # calling_llm will emit sending_to_llm event, so we don't need to emit it here
                df = pd.read_csv(cleaned_path)
            else:
                # Need to redo cleaning
                file_id, df = reading_file(file_path, event_emitter)
                update_task_status(file_id, TASK_STATUS_READING_DATASET_DONE, db_adapter)
                df = cleaning(file_id, df, event_emitter, db_adapter)
                update_task_status(file_id, TASK_STATUS_PROCESS_CLEANING_DONE, db_adapter)
            
            # calling_llm emits sending_to_llm, sending_to_llm_progression, and sending_to_llm_done events
            df, _ = calling_llm(file_id, df, ai_config, event_emitter)
            update_task_status(file_id, TASK_STATUS_SENDING_TO_LLM_DONE, db_adapter)
            
            # appending_columns emits appending_collumns and appending_collumns_done events
            appending_columns(file_id, event_emitter)
            update_task_status(file_id, TASK_STATUS_APPENDING_COLUMNS_DONE, db_adapter)
            
            # saving emits saving_file, saving_file_done, and done events
            saving(file_id, df, event_emitter, db_adapter)
            update_task_status(file_id, TASK_STATUS_DONE, db_adapter)
            
        elif last_step == TASK_STATUS_APPENDING_COLUMNS:
            # Resume from appending - need to read analysed file if exists
            # Services emit their own events, we just update DB status
            from src.configs.env import STORAGE_ANALYSED
            analysed_path = os.path.join(STORAGE_ANALYSED, f"{file_id}.csv")
            if os.path.exists(analysed_path):
                # LLM processing already done, continue from appending columns
                # appending_columns will emit appending_collumns event, so we don't need to emit it here
                df = pd.read_csv(analysed_path)
            else:
                # Need to redo previous steps
                file_id, df = reading_file(file_path, event_emitter)
                update_task_status(file_id, TASK_STATUS_READING_DATASET_DONE, db_adapter)
                df = cleaning(file_id, df, event_emitter, db_adapter)
                update_task_status(file_id, TASK_STATUS_PROCESS_CLEANING_DONE, db_adapter)
                df, _ = calling_llm(file_id, df, ai_config, event_emitter)
                update_task_status(file_id, TASK_STATUS_SENDING_TO_LLM_DONE, db_adapter)
            
            # appending_columns emits appending_collumns and appending_collumns_done events
            appending_columns(file_id, event_emitter)
            update_task_status(file_id, TASK_STATUS_APPENDING_COLUMNS_DONE, db_adapter)
            
            # saving emits saving_file, saving_file_done, and done events
            saving(file_id, df, event_emitter, db_adapter)
            update_task_status(file_id, TASK_STATUS_DONE, db_adapter)
            
        elif last_step == TASK_STATUS_SAVING_FILE:
            # Resume from saving - need to read analysed file if exists
            # Services emit their own events, we just update DB status
            from src.configs.env import STORAGE_ANALYSED
            analysed_path = os.path.join(STORAGE_ANALYSED, f"{file_id}.csv")
            if os.path.exists(analysed_path):
                # Previous steps already done, continue from saving
                # saving will emit saving_file event, so we don't need to emit it here
                df = pd.read_csv(analysed_path)
            else:
                # Need to redo previous steps
                file_id, df = reading_file(file_path, event_emitter)
                update_task_status(file_id, TASK_STATUS_READING_DATASET_DONE, db_adapter)
                df = cleaning(file_id, df, event_emitter, db_adapter)
                update_task_status(file_id, TASK_STATUS_PROCESS_CLEANING_DONE, db_adapter)
                df, _ = calling_llm(file_id, df, ai_config, event_emitter)
                update_task_status(file_id, TASK_STATUS_SENDING_TO_LLM_DONE, db_adapter)
                appending_columns(file_id, event_emitter)
                update_task_status(file_id, TASK_STATUS_APPENDING_COLUMNS_DONE, db_adapter)
            
            # saving emits saving_file, saving_file_done, and done events
            saving(file_id, df, event_emitter, db_adapter)
            update_task_status(file_id, TASK_STATUS_DONE, db_adapter)
        
        task_logger.info(f"Task {file_id} completed successfully")
        return {'success': True, 'file_id': file_id}
        
    except Exception as e:
        task_logger.error(f"Error processing task {file_id}: {e}", exc_info=True)
        import traceback
        traceback.print_exc()
        
        if db_adapter:
            update_task_status(file_id, TASK_STATUS_ON_ERROR, db_adapter)
            event_emitter(file_id, TASK_STATUS_ON_ERROR)
        
        # Re-raise to let Celery handle retry
        raise self.retry(exc=e, countdown=60, max_retries=3)


@celery_app.task(bind=True, name='src.tasks.processor.retry_dataset_step')
def retry_dataset_step(self, file_id: str, file_path: str, ai_config: dict, last_event_step: str):
    """
    Retry processing from a specific step.
    
    Args:
        file_id: File identifier
        file_path: Path to the dataset file
        ai_config: AI configuration dictionary
        last_event_step: Last step to resume from
    """
    # Delegate to process_dataset with last_step
    return process_dataset(file_id, file_path, ai_config, last_event_step)


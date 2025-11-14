"""Callback function for retrying from a specific step."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.configs.constants import (
    TASK_STATUS_IN_QUEUE, TASK_STATUS_READING_DATASET,
    TASK_STATUS_PROCESS_CLEANING, TASK_STATUS_SENDING_TO_LLM,
    TASK_STATUS_APPENDING_COLUMNS, TASK_STATUS_SAVING_FILE
)


def retry_step(file_id: str, last_event_step: str, file_path: str, ai_config: dict,
               db_adapter, event_emitter: callable) -> None:
    """
    Retry processing from a specific step.
    
    Args:
        file_id: File identifier
        last_event_step: Last step that was completed (or where to resume from)
        file_path: Path to the file
        ai_config: AI configuration dictionary
        db_adapter: Database adapter
        event_emitter: Function to emit events (file_id, event)
    """
    from src.services.reading_file import reading_file
    from src.services.cleaning import cleaning
    from src.services.calling_llm import calling_llm
    from src.services.appending_columns import appending_columns
    from src.services.saving import saving
    import pandas as pd
    
    # Determine which processing steps to execute based on last completed step
    steps_to_execute = []
    
    if last_event_step == TASK_STATUS_IN_QUEUE:
        steps_to_execute = ['read', 'clean', 'llm', 'append', 'save']
    elif last_event_step == TASK_STATUS_READING_DATASET:
        steps_to_execute = ['clean', 'llm', 'append', 'save']
    elif last_event_step == TASK_STATUS_PROCESS_CLEANING:
        steps_to_execute = ['llm', 'append', 'save']
    elif last_event_step == TASK_STATUS_SENDING_TO_LLM:
        steps_to_execute = ['llm', 'append', 'save']
    elif last_event_step == TASK_STATUS_APPENDING_COLUMNS:
        steps_to_execute = ['append', 'save']
    elif last_event_step == TASK_STATUS_SAVING_FILE:
        steps_to_execute = ['save']
    else:
        steps_to_execute = ['read', 'clean', 'llm', 'append', 'save']
    
    df = None
    
    for step in steps_to_execute:
        if step == 'read':
            file_id, df = reading_file(file_path, event_emitter)
        elif step == 'clean':
            if df is None:
                file_id, df = reading_file(file_path, event_emitter)
            df = cleaning(file_id, df, event_emitter, db_adapter)
        elif step == 'llm':
            if df is None:
                file_id, df = reading_file(file_path, event_emitter)
                df = cleaning(file_id, df, event_emitter, db_adapter)
            df, _ = calling_llm(file_id, df, ai_config, event_emitter)
        elif step == 'append':
            if df is None:
                file_id, df = reading_file(file_path, event_emitter)
                df = cleaning(file_id, df, event_emitter, db_adapter)
                df, _ = calling_llm(file_id, df, ai_config, event_emitter)
            appending_columns(file_id, event_emitter)
        elif step == 'save':
            if df is None:
                file_id, df = reading_file(file_path, event_emitter)
                df = cleaning(file_id, df, event_emitter, db_adapter)
                df, _ = calling_llm(file_id, df, ai_config, event_emitter)
            saving(file_id, df, event_emitter, db_adapter)


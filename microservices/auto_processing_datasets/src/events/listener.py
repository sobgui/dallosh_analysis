"""RabbitMQ event listener that dispatches Celery tasks."""
import pika
import json
import sys
import os
from typing import Optional

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.configs.env import RABBITMQ_URL, RABBITMQ_TOPIC_TASKS
from src.configs.constants import (
    EVENT_PROCEED_TASK, EVENT_RETRY_STEP, EVENT_HANDLE_PROCESS,
    TASK_STATUS_IN_QUEUE, TASK_STATUS_PAUSED, TASK_STATUS_STOPPED
)
from src.tasks.processor import process_dataset, retry_dataset_step
from celery import current_app


class EventListener:
    """RabbitMQ event listener that dispatches Celery tasks."""

    def __init__(self, db_adapter, logger=None):
        self.db = db_adapter
        self.connection: Optional[pika.BlockingConnection] = None
        self.channel: Optional[pika.channel.Channel] = None
        self.running = False
        # Store active task IDs for control operations
        self.active_tasks = {}  # {file_id: celery_task_id}
        # Setup logger
        if logger is None:
            from src.utils.logger import setup_logger
            self.logger = setup_logger('event_listener', 'listener.log')
        else:
            self.logger = logger

    def connect(self) -> None:
        """Connect to RabbitMQ."""
        try:
            self.connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
            self.channel = self.connection.channel()

            # Declare topic exchange
            self.channel.exchange_declare(
                exchange=RABBITMQ_TOPIC_TASKS,
                exchange_type='topic',
                durable=True
            )

            # Declare queue for this microservice (use different name to avoid conflict with Celery)
            queue_name = 'event_listener_queue'
            self.channel.queue_declare(queue=queue_name, durable=True)

            # Bind queue to exchange with routing keys
            self.channel.queue_bind(
                exchange=RABBITMQ_TOPIC_TASKS,
                queue=queue_name,
                routing_key=f'{EVENT_PROCEED_TASK}'
            )
            self.channel.queue_bind(
                exchange=RABBITMQ_TOPIC_TASKS,
                queue=queue_name,
                routing_key=f'{EVENT_RETRY_STEP}'
            )
            self.channel.queue_bind(
                exchange=RABBITMQ_TOPIC_TASKS,
                queue=queue_name,
                routing_key=f'{EVENT_HANDLE_PROCESS}'
            )

            # Set QoS to process one message at a time
            self.channel.basic_qos(prefetch_count=1)

            self.logger.info(f"Connected to RabbitMQ: {RABBITMQ_URL}")
            self.logger.info(f"Listening on exchange: {RABBITMQ_TOPIC_TASKS}, queue: {queue_name}")

        except Exception as e:
            self.logger.error(f"RabbitMQ connection error: {e}", exc_info=True)
            raise

    def disconnect(self) -> None:
        """Disconnect from RabbitMQ."""
        self.running = False
        if self.connection and not self.connection.is_closed:
            self.connection.close()
            self.logger.info("Disconnected from RabbitMQ")

    def emit_event(self, file_id: str, event: str) -> None:
        """Emit an event to RabbitMQ for frontend to listen.
        
        Routing key format: {file_id}.{event}
        This matches the frontend subscription pattern: /exchange/tasks/{fileId}.*
        """
        if not self.channel or self.channel.is_closed:
            return

        try:
            message = json.dumps({'file_id': file_id, 'event': event})
            # Routing key format: {file_id}.{event} to match frontend subscription pattern
            # Frontend subscribes to: /exchange/tasks/{fileId}.*
            routing_key = f"{file_id}.{event}"
            self.channel.basic_publish(
                exchange=RABBITMQ_TOPIC_TASKS,
                routing_key=routing_key,
                body=message,
                properties=pika.BasicProperties(delivery_mode=2)  # Make message persistent
            )
            self.logger.info(f"Emitted event: {event} for file_id: {file_id} with routing_key: {routing_key}")
        except Exception as e:
            self.logger.error(f"Error emitting event: {e}", exc_info=True)

    def update_task_status(self, file_id: str, status: str) -> None:
        """Update task status in database."""
        try:
            from datetime import datetime
            # Find task by file_id
            task = self.db.find_one('tasks', {'data.file_id': file_id})
            if task:
                self.db.update_one(
                    'tasks',
                    {'data.file_id': file_id},
                    {
                        'data.status': status,
                        'updatedAt': datetime.utcnow(),
                        'updatedBy': 'system'
                    }
                )
        except Exception as e:
            self.logger.error(f"Error updating task status: {e}", exc_info=True)

    def _handle_proceed_task(self, message: dict) -> None:
        """Handle proceed_task event by dispatching Celery task."""
        file_id = message.get('file_id')
        file_path = message.get('file_path')
        ai_config = message.get('ai', {})

        if not file_id or not file_path:
            self.logger.warning("Invalid proceed_task message: missing file_id or file_path")
            return

        self.logger.info(f"Received proceed_task for file_id: {file_id}, file_path: {file_path}")

        # Update database to in_queue (processor will emit the event to avoid duplication)
        self.update_task_status(file_id, TASK_STATUS_IN_QUEUE)

        # Dispatch Celery task (processor will emit in_queue event and handle all subsequent events)
        try:
            task = process_dataset.delay(file_id, file_path, ai_config, TASK_STATUS_IN_QUEUE)
            self.active_tasks[file_id] = task.id
            self.logger.info(f"Dispatched Celery task {task.id} for file_id: {file_id}")
        except Exception as e:
            self.logger.error(f"Error dispatching Celery task: {e}", exc_info=True)
            self.update_task_status(file_id, 'on_error')
            self.emit_event(file_id, 'on_error')

    def _handle_retry_step(self, message: dict) -> None:
        """Handle retry_step event by dispatching Celery task."""
        file_id = message.get('file_id')
        file_path = message.get('file_path')
        ai_config = message.get('ai', {})
        last_event_step = message.get('last_event_step')

        if not file_id or not file_path or not last_event_step:
            self.logger.warning("Invalid retry_step message: missing required fields")
            return

        self.logger.info(f"Received retry_step for file_id: {file_id}, last_step: {last_event_step}")

        # Update database
        self.update_task_status(file_id, last_event_step)
        self.emit_event(file_id, last_event_step)

        # Dispatch Celery task
        try:
            task = retry_dataset_step.delay(file_id, file_path, ai_config, last_event_step)
            self.active_tasks[file_id] = task.id
            self.logger.info(f"Dispatched Celery retry task {task.id} for file_id: {file_id}")
        except Exception as e:
            self.logger.error(f"Error dispatching Celery retry task: {e}", exc_info=True)
            self.update_task_status(file_id, 'on_error')
            self.emit_event(file_id, 'on_error')

    def _handle_process_control(self, message: dict) -> None:
        """Handle process control events (pause/resume/stop) using Celery control."""
        file_id = message.get('file_id')
        event = message.get('event')

        if not file_id or not event:
            self.logger.warning("Invalid handle_process message: missing file_id or event")
            return

        self.logger.info(f"Received handle_process: {event} for file_id: {file_id}")

        # Get Celery task ID for this file_id
        celery_task_id = self.active_tasks.get(file_id)
        if not celery_task_id:
            self.logger.warning(f"No active Celery task found for file_id: {file_id}")
            return

        try:
            if event == 'pause':
                # Revoke task (terminate it)
                current_app.control.revoke(celery_task_id, terminate=True)
                self.update_task_status(file_id, TASK_STATUS_PAUSED)
                self.emit_event(file_id, TASK_STATUS_PAUSED)
                self.logger.info(f"Paused task {celery_task_id} for file_id: {file_id}")
                
            elif event == 'resume':
                # Get task info to resume from last step
                task = self.db.find_one('tasks', {'data.file_id': file_id})
                if task:
                    last_step = task.get('data', {}).get('status', TASK_STATUS_IN_QUEUE)
                    file_path = task.get('data', {}).get('file_path')
                    ai_config = task.get('data', {}).get('ai', {})
                    
                    if file_path:
                        # Dispatch new task from last step
                        new_task = process_dataset.delay(file_id, file_path, ai_config, last_step)
                        self.active_tasks[file_id] = new_task.id
                        self.update_task_status(file_id, last_step)
                        self.emit_event(file_id, last_step)
                        self.logger.info(f"Resumed task {new_task.id} for file_id: {file_id} from step: {last_step}")
                
            elif event == 'stop':
                # Revoke and terminate task
                current_app.control.revoke(celery_task_id, terminate=True)
                self.update_task_status(file_id, TASK_STATUS_STOPPED)
                self.emit_event(file_id, TASK_STATUS_STOPPED)
                if file_id in self.active_tasks:
                    del self.active_tasks[file_id]
                self.logger.info(f"Stopped task {celery_task_id} for file_id: {file_id}")
                
        except Exception as e:
            self.logger.error(f"Error handling process control: {e}", exc_info=True)

    def _process_message(self, ch, method, properties, body) -> None:
        """Process incoming message from RabbitMQ."""
        try:
            self.logger.info(f"Received message - routing_key: {method.routing_key}, exchange: {method.exchange}")
            self.logger.debug(f"Message body: {body.decode('utf-8')[:200]}...")
            
            message = json.loads(body.decode('utf-8'))
            routing_key = method.routing_key

            self.logger.info(f"Processing message with routing_key: {routing_key}")

            # Determine event type from routing key
            if routing_key == EVENT_PROCEED_TASK or routing_key.startswith(EVENT_PROCEED_TASK):
                self.logger.info(f"Matched EVENT_PROCEED_TASK, calling _handle_proceed_task")
                self._handle_proceed_task(message)
            elif routing_key == EVENT_RETRY_STEP or routing_key.startswith(EVENT_RETRY_STEP):
                self.logger.info(f"Matched EVENT_RETRY_STEP, calling _handle_retry_step")
                self._handle_retry_step(message)
            elif routing_key == EVENT_HANDLE_PROCESS or routing_key.startswith(EVENT_HANDLE_PROCESS):
                self.logger.info(f"Matched EVENT_HANDLE_PROCESS, calling _handle_process_control")
                self._handle_process_control(message)
            else:
                # Ignore other events (like status events emitted by microservice itself)
                self.logger.warning(f"Unknown routing_key: {routing_key}, ignoring message")
                pass

            # Acknowledge message
            ch.basic_ack(delivery_tag=method.delivery_tag)
            self.logger.info(f"Message acknowledged for routing_key: {routing_key}")

        except json.JSONDecodeError as e:
            self.logger.error(f"Error decoding message: {e}", exc_info=True)
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        except Exception as e:
            self.logger.error(f"Error processing message: {e}", exc_info=True)
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

    def start_listening(self) -> None:
        """Start listening to RabbitMQ events."""
        if not self.channel:
            self.connect()

        self.running = True

        # Start consuming messages
        queue_name = 'event_listener_queue'
        self.channel.basic_consume(
            queue=queue_name,
            on_message_callback=self._process_message
        )

        self.logger.info("Started listening to RabbitMQ events and dispatching Celery tasks...")

        # Start consuming (blocking)
        try:
            self.channel.start_consuming()
        except KeyboardInterrupt:
            self.logger.info("Stopping event listener...")
            self.stop_listening()

    def stop_listening(self) -> None:
        """Stop listening to RabbitMQ events."""
        self.running = False
        if self.channel and not self.channel.is_closed:
            self.channel.stop_consuming()
        self.disconnect()

#!/usr/bin/env python
"""Purge stale tasks from Celery queues."""
import sys
import os
import pika

# Add project root to path
project_root = '/project/microservices/auto_processing_datasets'
sys.path.insert(0, project_root)

try:
    from src.configs.env import RABBITMQ_URL
    
    # Connect to RabbitMQ
    connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
    channel = connection.channel()
    
    # Purge the celery_processing_queue
    queue_name = 'celery_processing_queue'
    try:
        result = channel.queue_purge(queue=queue_name)
        # Extract message count from the result
        message_count = result.method.message_count if hasattr(result, 'method') else 0
        print(f'✓ Purged {message_count} stale task(s) from queue: {queue_name}')
    except Exception as e:
        print(f'⚠ Queue {queue_name} might not exist yet: {e}')
    
    # Also purge the default Celery queue if it exists
    try:
        result2 = channel.queue_purge(queue='celery')
        message_count2 = result2.method.message_count if hasattr(result2, 'method') else 0
        if message_count2 > 0:
            print(f'✓ Purged {message_count2} stale task(s) from queue: celery')
    except:
        pass  # Queue might not exist
    
    try:
        channel.close()
    except:
        pass
    try:
        connection.close()
    except:
        pass
except Exception as e:
    print(f'⚠ Warning: Could not purge queue: {e}')
    print('Continuing anyway...')
    sys.exit(0)  # Don't fail, just continue

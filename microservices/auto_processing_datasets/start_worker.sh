#!/bin/bash
# Startup script for Celery worker that purges old tasks

set -e

echo "=========================================="
echo "Starting Celery Worker with Queue Purge"
echo "=========================================="

# Wait for RabbitMQ to be ready
echo "Waiting for RabbitMQ to be ready..."
until python -c "import pika; pika.BlockingConnection(pika.URLParameters('${RABBITMQ_URL:-amqp://admin:admin123@rabbitmq:5672/}'))" 2>/dev/null; do
  echo "Waiting for RabbitMQ..."
  sleep 2
done
echo "✓ RabbitMQ is ready"

# Purge the Celery queue to clear any stale tasks via RabbitMQ
echo "Purging stale tasks from Celery queue..."
python purge_queue.py

# Start the Celery worker
echo "Starting Celery worker..."
exec celery -A src.celery_app:celery_app worker \
    --loglevel=info \
    --queues=celery_processing_queue \
    --pool=solo \
    --concurrency=1

#!/bin/bash
# Script pour reconstruire rapidement le frontend

docker-compose build dallosh_analysis_client
docker-compose build microservice_celery_worker
docker-compose build microservice_celery_listener
docker-compose build ollama


docker-compose up -d dallosh_analysis_client
docker-compose up -d microservice_celery_worker
docker-compose up -d microservice_celery_listener
docker-compose up -d ollama



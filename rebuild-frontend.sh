#!/bin/bash
# Script pour reconstruire rapidement le frontend

docker-compose build dallosh_analysis_client

docker-compose up -d dallosh_analysis_client


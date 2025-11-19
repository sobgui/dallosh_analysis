#!/bin/bash
# Script pour voir les logs de tous les services

echo "📋 État de tous les conteneurs:"
echo "================================"
docker-compose ps
echo ""
echo ""
echo "📝 Logs de tous les services (50 dernières lignes):"
echo "===================================================="
docker-compose logs --tail=50

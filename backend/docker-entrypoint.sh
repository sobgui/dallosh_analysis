#!/bin/sh
set -e

# Fix permissions for storage and logs directories as root
# These are volume mounts, so we need to ensure they're writable
if [ -d "/project/backend/storage" ]; then
    chmod -R 777 /project/backend/storage 2>/dev/null || true
fi

if [ -d "/project/backend/logs" ]; then
    chmod -R 777 /project/backend/logs 2>/dev/null || true
fi

# If running as root, switch to bun user; otherwise run directly
if [ "$(id -u)" = "0" ]; then
    exec su -s /bin/sh bun -c "$*"
else
    exec "$@"
fi

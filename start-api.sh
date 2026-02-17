#!/bin/bash

# Start PHP built-in server for API
echo "Starting PHP API server on http://localhost:8000"
cd "$(dirname "$0")/api"
php -S localhost:8000

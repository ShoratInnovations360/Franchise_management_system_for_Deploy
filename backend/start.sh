#!/bin/bash

# Wait for Postgres to be ready (retry until successful)
echo "Waiting for database..."
until python manage.py migrate --noinput; do
    echo "Postgres is unavailable - sleeping"
    sleep 5
done

# Collect static files
python manage.py collectstatic --noinput

# Start Gunicorn
gunicorn backend_project.wsgi:application --bind 0.0.0.0:$PORT

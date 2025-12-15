#!/bin/bash
set -e

echo "Starting Gunicorn..."
gunicorn backend_project.wsgi:application --bind 0.0.0.0:$PORT &

echo "Waiting for database..."
sleep 10

echo "Running migrations..."
python manage.py migrate --noinput || true
python manage.py collectstatic --noinput || true

wait

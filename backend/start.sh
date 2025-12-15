#!/bin/bash

# Run migrations after DB is ready
python manage.py migrate --noinput

# Collect static files (optional if not done in build)
python manage.py collectstatic --noinput

# Start Django with Gunicorn
gunicorn backend_project.wsgi:application --bind 0.0.0.0:$PORT

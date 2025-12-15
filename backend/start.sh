#!/bin/bash

# Wait until Postgres is ready
echo "Waiting for database to be ready..."
until python - <<END
import psycopg2, os, sys
try:
    conn = psycopg2.connect(os.environ['DATABASE_URL'], sslmode='require')
    conn.close()
except Exception as e:
    sys.exit(1)
END
do
  echo "Postgres unavailable - sleeping 5s"
  sleep 5
done

echo "Database ready! Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn..."
gunicorn backend_project.wsgi:application --bind 0.0.0.0:$PORT

#!/bin/bash
set -e

echo "Waiting for database..."

until python - <<EOF
import psycopg2, os
psycopg2.connect(os.environ["DATABASE_URL"], sslmode="require")
EOF
do
  echo "Postgres unavailable - sleeping 10s"
  sleep 10
done

echo "Database is ready"

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec gunicorn backend_project.wsgi:application --bind 0.0.0.0:$PORT

#!/bin/bash
set -e

echo "Waiting for database..."

python << END
import time, psycopg2, os

db_url = os.environ["DATABASE_URL"]

while True:
    try:
        psycopg2.connect(db_url)
        print("Database is ready!")
        break
    except Exception as e:
        print("Postgres unavailable - sleeping 5s")
        time.sleep(5)
END

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec gunicorn backend_project.wsgi:application --bind 0.0.0.0:$PORT

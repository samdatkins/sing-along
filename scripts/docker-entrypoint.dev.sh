#!/bin/bash

# until psql "postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:5432/$POSTGRES_USER" -c '\l'; do
#   echo >&2 "postgres is unavailable - sleeping"
#   sleep 1
# done

echo "Collect static files"
python manage.py collectstatic --noinput

echo "Apply database migrations"
python manage.py migrate

echo "Starting dev server"
DJANGO_ENV=development python manage.py runserver 0.0.0.0:8080
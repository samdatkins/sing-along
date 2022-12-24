#!/bin/bash

echo "Collect static files"
python manage.py collectstatic --noinput

echo "Apply database migrations"
python manage.py migrate

echo "Starting prod server"
gunicorn sing_along.wsgi:application --bind 0.0.0.0:8080 --workers 3 --log-level=info --capture-output
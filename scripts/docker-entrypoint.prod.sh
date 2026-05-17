#!/bin/bash

echo "Collect static files"
python manage.py collectstatic --noinput

echo "Apply database migrations"
python manage.py migrate

echo "Starting prod server"
daphne -b 0.0.0.0 -p 8080 --proxy-headers sing_along.asgi:application
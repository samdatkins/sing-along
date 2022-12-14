#!/bin/bash

echo "Collect static files"
python manage.py collectstatic --noinput

echo "Apply database migrations"
python manage.py migrate

echo "Starting dev server"
DJANGO_ENV=development python manage.py runserver 0.0.0.0:8080
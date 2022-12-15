#!/bin/bash

set -e

export ENV=Test
export DEBUG=false

until psql "postgresql://postgres:postgres@db:5432/postgres" -c '\l'; do
  echo >&2 "postgres is unavailable - sleeping"
  sleep 1
done

echo "Apply database migrations"
python manage.py migrate

echo "Run tests"
python manage.py test

#!/bin/bash

set -e

export ENV=Test
export DEBUG=false

until psql "postgresql://postgres:$POSTGRES_PASSWORD@$POSTGRES_HOST:5432/postgres" -c '\l'; do
  echo >&2 "postgres is unavailable - sleeping"
  sleep 1
done

python manage.py test

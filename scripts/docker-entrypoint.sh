#!/bin/bash

until psql "postgresql://postgres:postgres@db:5432/postgres" -c '\l'; do
  echo >&2 "postgres is unavailable - sleeping"
  sleep 1
done

if [ "${YOUR_ENV}" == "production" ]; then
  ./scripts/docker-entrypoint.prod.sh
else
  ./scripts/docker-entrypoint.dev.sh
fi
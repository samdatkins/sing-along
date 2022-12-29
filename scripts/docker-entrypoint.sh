#!/bin/bash

until psql "${POSTGRES_URL}" -c '\l'; do
  echo >&2 "postgres is unavailable at ${POSTGRES_URL} - sleeping"
  sleep 1
done

if [ "${YOUR_ENV}" == "production" ]; then
  ./scripts/docker-entrypoint.prod.sh
else
  ./scripts/docker-entrypoint.dev.sh
fi

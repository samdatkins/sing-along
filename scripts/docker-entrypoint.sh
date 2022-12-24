#!/bin/bash

# until psql "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_NAME}" -c '\l'; do
#   echo >&2 "postgres is unavailable - sleeping"
#   sleep 1
# done

if [ "${YOUR_ENV}" == "production" ]; then
  ./scripts/docker-entrypoint.prod.sh
else
  ./scripts/docker-entrypoint.dev.sh
fi

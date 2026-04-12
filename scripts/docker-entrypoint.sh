#!/bin/bash

# psql uses $PAGER (often `less`) for multi-line output; that blocks with "(END)" until a key is
# pressed, so the wait loop never completes and gunicorn never starts. Force no pager.
export PAGER=cat
export PSQL_PAGER=cat

until psql "${DATABASE_URL}" -c '\l'; do
  echo >&2 "postgres is unavailable - sleeping"
  sleep 1
done

# Appliku and some hosts set DJANGO_ENV=production but not YOUR_ENV; honor either.
if [ "${YOUR_ENV}" == "production" ] || [ "${DJANGO_ENV}" == "production" ]; then
  exec ./scripts/docker-entrypoint.prod.sh
else
  exec ./scripts/docker-entrypoint.dev.sh
fi

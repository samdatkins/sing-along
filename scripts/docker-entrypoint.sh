#!/bin/bash

if [ "${YOUR_ENV}" == "production" ]; then
  ./scripts/docker-entrypoint.prod.sh
else
  ./scripts/docker-entrypoint.dev.sh
fi
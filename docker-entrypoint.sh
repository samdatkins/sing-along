#!/bin/bash

if [ "${YOUR_ENV}" == "production" ]; then
  ./docker-entrypoint.prod.sh
else
  ./docker-entrypoint.dev.sh
fi
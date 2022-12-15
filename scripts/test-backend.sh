#!/usr/bin/env bash

set -euo pipefail

docker-compose -f docker-compose-cicd.yml down -v
docker-compose -f docker-compose-cicd.yml up --build --exit-code-from web

#!/usr/bin/env bash

set -euo pipefail

docker-compose -f docker-compose-test-cicd.yml down -v
docker-compose -f docker-compose-test-cicd.yml up --build --exit-code-from web

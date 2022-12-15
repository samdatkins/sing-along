#!/bin/bash

set -e

export ENV=Test
export DEBUG=false

python manage.py test

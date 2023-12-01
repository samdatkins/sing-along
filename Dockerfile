# syntax=docker/dockerfile:1
FROM node:21 AS frontend
RUN mkdir /code
WORKDIR /code

COPY frontend/ frontend-build/
WORKDIR /code/frontend-build/
RUN yarn install && GENERATE_SOURCEMAP=false yarn build

# using 3.11 for now because 3.12 breaks things, could fix this but it would slow down
# deploys: https://stackoverflow.com/questions/77364550/attributeerror-module-pkgutil-has-no-attribute-impimporter-did-you-mean
FROM python:3.11-slim-bullseye
ARG YOUR_ENV

ENV YOUR_ENV=${YOUR_ENV}
ENV PYTHONUNBUFFERED=1

# System deps:
RUN apt-get update && apt-get install -y gcc musl-dev python3-dev libffi-dev cargo rustc postgresql-client
RUN pip install "poetry==1.7.1"

# Copy only requirements to cache them in docker layer
WORKDIR /code
COPY poetry.lock pyproject.toml /scripts/ /code/
COPY --from=frontend /code/frontend-build/build/ /code/frontend/build

# Project initialization:
RUN poetry config virtualenvs.create false \
  && poetry install $(test "$YOUR_ENV" == production && echo "--without dev") --no-interaction --no-ansi

# Creating folders, and files for a project:
COPY . /code

CMD ./scripts/docker-entrypoint.sh
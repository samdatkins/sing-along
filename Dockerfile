# syntax=docker/dockerfile:1
FROM node:18 AS frontend
RUN mkdir /code
WORKDIR /code

COPY frontend/ frontend-build/
WORKDIR /code/frontend-build/
RUN yarn install && GENERATE_SOURCEMAP=false yarn build

FROM python:3.10-slim-bullseye
ARG YOUR_ENV

ENV YOUR_ENV=${YOUR_ENV}
ENV PYTHONUNBUFFERED=1

# System deps:
RUN apt-get update && apt-get install -y gcc musl-dev python3-dev libffi-dev cargo rustc postgresql-client
RUN pip install "poetry==1.2.2"

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
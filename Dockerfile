# syntax=docker/dockerfile:1
FROM node:22 AS frontend
RUN mkdir /code
WORKDIR /code

COPY frontend/ frontend-build/
WORKDIR /code/frontend-build/
ENV NODE_OPTIONS=--max-old-space-size=1536
RUN npm install -g corepack
RUN corepack cache clean
RUN corepack enable && yarn install && GENERATE_SOURCEMAP=false yarn build

FROM python:3.14-slim-bookworm
ARG YOUR_ENV

ENV YOUR_ENV=${YOUR_ENV}
ENV PYTHONUNBUFFERED=1

# System deps:
RUN apt-get update && apt-get install -y gcc musl-dev python3-dev libffi-dev cargo rustc postgresql-client \
  && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir "poetry>=2.1.0,<3.0.0"

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

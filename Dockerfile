# syntax=docker/dockerfile:1
FROM python:3
ENV PYTHONUNBUFFERED=1

# System deps:
RUN apt-get update && apt-get install -y gcc musl-dev python3-dev libffi-dev cargo rustc
RUN pip install "poetry==1.1.11"

# Copy only requirements to cache them in docker layer
WORKDIR /code
COPY poetry.lock pyproject.toml /code/

# Project initialization:
RUN poetry config virtualenvs.create false \
  && poetry install $(test "$YOUR_ENV" == production && echo "--no-dev") --no-interaction --no-ansi

# Creating folders, and files for a project:
COPY . /code
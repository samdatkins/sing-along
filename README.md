# Sing-along App

## Installation

- Backend
  - Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
  - Install poetry
    - `curl -sSL https://install.python-poetry.org | python3 -`
    - The command will tell you to run a command that looks something like this `export PATH="/Users/{your username}/.local/bin:$PATH"`, so do that.
  - Run `docker-compose up`
- Frontend
  - Install NPM
    - `brew install node`
  - Install Yarn
    - `npm install --global yarn`

## Loading seed data

- Connect to the web docker instance
  - From the root of the project: `docker-compose run web bash`
- Load the seed data into the database
  - `python manage.py loaddata api/seed/0001_initial.json`

## Stack Brainstorming

- Web server
  - Typescript
  - React
  - Python/Django
  - Websockets
  - Material UI
  - Docker
  - Memcached
- Async
  - RQ

https://profy.dev/article/react-tech-stack#1-most-popular-react-libraries

## App Design

Standard web server w/ db, when songs are requested search the db to see if they already exist. If they don’t exist, fire off a request to the async server which can go out and locate the song, then hit a webhook on the web server with the result.

Use SSE to push data to clients to keep them up to date. SSE loop can check memcached to see if current state has changed, and if so update it.

## User Stories

### Data/Events on sing-along page

- Data
  - Song contents
  - Timer
  - Current position (cur song / total songs)

# References

- [Docker tutorial for python](https://docs.docker.com/samples/django/)
- [Building a hybrid python/react app](https://fractalideas.com/blog/making-react-and-django-play-well-together-hybrid-app-model/)

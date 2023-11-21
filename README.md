# Sing-along App

## Installation

- Backend
  - Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
  - Install pipx
    - `brew install pipx`
  - Install poetry
    - `pipx install poetry==1.2.2`
    - The command will tell you to run a command that looks something like this: `export PATH="/Users/{your username}/.local/bin:$PATH"`, so add that to the end of your `~/.zshrc` file and re-open your terminal
  - run `poetry config virtualenvs.in-project true`
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

## Running the project

- Backend
  - Run `poetry install` from the root of the project
  - Run `docker-compose up --build` from the root of the project
  - To access the backend api, go to `localhost:8080/api` in a browser
  - To access the Django Admin, go to `localhost:8080/admin` in a browser
- Frontend
  - Go to the `frontend` folder in a terminal
  - Run `yarn install && yarn start`
  - To view the web application, go to `localhost:3000` in a browser
  - Note: To login to auth0, you'll need to access `localhost:8080` first

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

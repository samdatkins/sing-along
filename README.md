# Sing-along App

## Mac Installation

- Backend
  - Ensure you're running python 3.9 - 3.11 (`python3 --version`)
    - If not, install and use python 3.11 using `pyenv`
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
  - Run `docker-compose up --build` (mac) or `sudo docker compose up --build` (Linux) from the root of the project
  - To access the backend api, go to `localhost:8080/api` in a browser
  - To access the Django Admin, go to `localhost:8080/admin` in a browser
- Frontend
  - Go to the `frontend` folder in a terminal
  - Run `yarn install && yarn start`
  - To view the web application, go to `localhost:3000` in a browser
  - Note: To login to auth0, you'll need to access `localhost:8080` first

## Ubuntu Based Installation
For these examples it's assumed that `asdf` is the version manager being used for **Python**, **Node**, and **Pipx**.
https://asdf-vm.com/guide/getting-started.html

### Ensure needed libraries are installed

```bash
sudo apt update; sudo apt install --no-install-recommends make build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev
```

```bash
sudo apt install -y gcc make zlib1g-dev libreadline-dev libreadline8 sqlite3 libsqlite3-dev libbz2-dev python-tk python3-tk tk-dev
```
### Base Backend Setup

Install **Python**. Note it **must be 3.9 or 3.10**
```bash
asdf plugin add python
asdf install python 3.10.13
asdf global python 3.10.13
```

Install **pipx**
```bash
asdf plugin add pipx
asdf install pipx latest
asdf global pipx latest
```

Install **Poetry**
```bash
pipx install poetry==1.2.2
pipx ensurepath

source ~/.zshrc

poetry config virtualenvs.in-project true
```

Install **Docker**
*directions from here*: https://get.docker.com/
```bash
# 1. download the script
curl -fsSL https://get.docker.com -o install-docker.sh

# 2. verify the script's content
cat install-docker.sh

# 3. run the script with --dry-run to verify the steps it executes
sh install-docker.sh --dry-run

# 4. run the script either as root, or using sudo to perform the installation.
sudo sh install-docker.sh

# remove install-docker.sh
rm install-docker.sh
```

## Frontend Setup

Install **Node**
```bash
asdf plugin add nodejs
asdf install nodejs latest
asdf global nodejs latest
```

Install **Yarn**
```bash
npm install --global yarn
```

### Setup Docker And Database

Add **Docker** group
*directions from here*: https://docs.docker.com/engine/install/linux-postinstall/

```bash
# Create the docker group
sudo groupadd docker

# Add your user to the docker group
sudo usermod -aG docker $USER

newgrp docker

# Verify that you can run docker commands
docker run hello-world
```

Copy the `.env-sample` file in root and populate it with your values.

Run migrations, seed the database, and create an admin user.
```base
# TODO: Figure out why sudo is needed here and when running build

# access console in Docker
sudo docker compose run web bash

# this is all run in the resulting console
# run migrations
./manage.py migrate

# seed the db
python manage.py loaddata api/seed/0001_initial.json

# create admin user
python manage.py createsuperuser

exit
```

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

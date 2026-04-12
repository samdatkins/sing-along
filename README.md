# Sing-along App

## Mac Installation

- Backend
  - Use **Python 3.10+** (the project targets **3.14** with **Django 5.2.8+**). Check with `python3 --version`.
    - With **pyenv**: install e.g. `pyenv install 3.14` and `pyenv local 3.14` in the repo.
  - Install a container runtime ([Docker Desktop](https://www.docker.com/products/docker-desktop) or [OrbStack](https://orbstack.dev/), etc.)
  - Install pipx: `brew install pipx`
  - Install Poetry (version should be **2.x**, aligned with [Dockerfile](Dockerfile)):
    - `pipx install poetry` (or `pipx install poetry==2.1.2` to pin)
    - If prompted, add pipx’s bin dir to `PATH` (often `~/.local/bin`) in `~/.zshrc` and restart the shell.
  - Run `poetry config virtualenvs.in-project true`
- Frontend
  - Install Node: `brew install node`
  - Install Yarn: `npm install --global yarn`

## Loading seed data

- Connect to the web docker instance
  - From the root of the project: `docker compose run --rm web bash`
- Load the seed data into the database (inside that shell)
  - `python manage.py loaddata api/seed/0001_initial.json`

## Running the project

- Backend
  - Copy `.env-sample` to `.env` and set secrets. For **`docker compose`**, the `web` service sets `DATABASE_URL` to use the `db` hostname (see [`docker-compose.yml`](docker-compose.yml)); that matches CI and production.
  - Run `poetry install` from the repo root if you want a local venv for editor/IDE tooling (optional).
  - **Migrations and tests — run inside Docker** (same environment as CI and production). Do not rely on host `poetry run …` for migrate/test unless you know what you are doing.
    - Migrations: `docker compose run --rm web python manage.py migrate`
    - Tests: `docker compose run --rm web python manage.py test`
    - Full CI-style backend test (compose build + migrate + test): `./scripts/test-backend.sh`
  - **PostgreSQL**: Django 5.2 requires **PostgreSQL 14+**. Compose uses **Postgres 16**. If you previously used Postgres 13 in Docker, run `docker compose down -v` to drop the old volume (or migrate data yourself), then bring the stack up again and re-seed.
  - Run `docker compose up --build` (mac) or `sudo docker compose up --build` (Linux) from the root of the project.
  - To access the backend api, go to `localhost:8080/api` in a browser.
  - To access the Django Admin, go to `localhost:8080/admin` in a browser.
- Frontend
  - Go to the `frontend` folder in a terminal.
  - Run `yarn install && yarn start`.
  - To view the web application, go to `localhost:3000` in a browser.
  - Note: To login to auth0, you'll need to access `localhost:8080` first.

## Upgrade history (Django / Python)

Major backend upgrades are tracked against Django’s release notes. When bumping Django, read the **Backwards incompatible changes** sections in order:

1. [Django 4.0](https://docs.djangoproject.com/en/5.2/releases/4.0/)
2. [Django 4.1](https://docs.djangoproject.com/en/5.2/releases/4.1/)
3. [Django 4.2](https://docs.djangoproject.com/en/5.2/releases/4.2/)
4. [Django 5.0](https://docs.djangoproject.com/en/5.2/releases/5.0/)
5. [Django 5.1](https://docs.djangoproject.com/en/5.2/releases/5.1/)
6. [Django 5.2](https://docs.djangoproject.com/en/5.2/releases/5.2/)

Official guide: [Upgrading Django](https://docs.djangoproject.com/en/5.2/howto/upgrade-version/).

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

Install **Python** (**3.10+**; **3.14** is supported with Django **5.2.8+**).

```bash
asdf plugin add python
asdf install python 3.14.0
asdf global python 3.14.0
```

Install **pipx**

```bash
asdf plugin add pipx
asdf install pipx latest
asdf global pipx latest
```

Install **Poetry** (2.x recommended)

```bash
pipx install poetry
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

Run migrations, seed the database, and create an admin user (all **inside** the `web` container so it matches CI/production).

```bash
# TODO: Figure out why sudo is needed here and when running build

# access console in Docker
sudo docker compose run --rm web bash

# in that shell:
python manage.py migrate
python manage.py loaddata api/seed/0001_initial.json
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

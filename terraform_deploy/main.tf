terraform {
  backend "remote" {
    hostname = "app.terraform.io"
    organization = "sing-along"
    workspaces {
      prefix = "sing-along-"
    }
  }
  required_providers {
    digitalocean = {
      source = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do-token
}

resource "digitalocean_database_cluster" "singalong" {
  engine = "pg"
  name = "sing-along-db-${var.environment}"
  node_count = 1
  region = "${var.region}3"
  size = "db-s-1vcpu-1gb"
  version = "13"
  lifecycle {
    prevent_destroy = true
  }
}

resource "digitalocean_app" "singalong" {
  spec {
    name = "sing-along-app-${var.environment}"
    region = var.region
    service {
      name = "singalong"
      dockerfile_path = "Dockerfile"
      http_port = 8080
      instance_count = 1
      instance_size_slug = "basic-xxs"
      routes {
        path = "/"
      }
      source_dir = "/"
      github {
        branch = "main"
        deploy_on_push = true
        repo = "samdatkins/sing-along"
      }
      env {
        key = "POSTGRES_NAME"
        value = digitalocean_database_cluster.singalong.database
        scope = "RUN_TIME"
        type = "GENERAL"
      }
      env {
        key = "POSTGRES_USER"
        value = digitalocean_database_cluster.singalong.user
        scope = "RUN_TIME"
        type = "GENERAL"
      }
      env {
        key = "POSTGRES_PASSWORD"
        value = digitalocean_database_cluster.singalong.password
        scope = "RUN_TIME"
        type = "SECRET"
      }
      env {
        key = "POSTGRES_HOST"
        value = digitalocean_database_cluster.singalong.host
        scope = "RUN_TIME"
        type = "GENERAL"
      }
      env {
        key = "POSTGRES_PORT"
        value = digitalocean_database_cluster.singalong.port
        scope = "RUN_TIME"
        type = "GENERAL"
      }
      env {
        key = "YOUR_ENV"
        value = "${var.environment}"
        scope = "RUN_TIME"
        type = "GENERAL"
      }
      env {
        key = "TAB_SEARCH_URL"
        value = "${var.tab-search-url}"
        scope = "RUN_TIME"
        type= "GENERAL"
      }
    }
  }
}

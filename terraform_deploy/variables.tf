variable "do-token" {
  description = "Digital Ocean auth token."
}

variable "environment" {
  default = "development"
  description = "Name of the deployment environment."
}

variable "tab-search-url" {
  default = ''
  description = 'Where should we look for tabs?'
}

variable "is-production" {
  default = false
  description = "Is this a production deployment?"
}

variable "region" {
  default = "nyc"
  description = "Digital Ocean region to deploy in."
}

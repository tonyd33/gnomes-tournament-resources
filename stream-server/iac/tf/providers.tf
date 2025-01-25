terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.32.0"
    }
    ansible = {
      source = "ansible/ansible"
      version = "~>1.3.0"
    }
    porkbun = {
      source = "cullenmcdermott/porkbun"
      version = "0.3.0"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "ca-west-1"
}

provider "porkbun" {
  api_key = var.porkbun_api_key
  secret_key = var.porkbun_secret_key
}


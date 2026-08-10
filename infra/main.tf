terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.58"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

variable "aws_region" {
  description = "Primary AWS region for S3."
  type        = string
  default     = "ap-south-1"
}

variable "root_domain" {
  description = "Route53 hosted zone apex."
  type        = string
  default     = "nammamedmate.com"
}

variable "mfe_domain_suffix" {
  description = "Suffix for MFE subdomains (name.mfe.nammamedmate.com)."
  type        = string
  default     = "mfe.nammamedmate.com"
}

variable "portal_origins" {
  description = "Allowed browser origins for MFE CORS (PharmacyPortal)."
  type        = list(string)
  default = [
    "https://pharmacy.nammamedmate.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]
}

variable "github_org" {
  type    = string
  default = "Iamreyansh"
}

variable "github_org_id" {
  type    = string
  default = "43453546"
}

variable "github_repo" {
  type    = string
  default = "MED0003_MFE"
}

variable "github_repo_id" {
  type    = string
  default = "1309167446"
}

variable "project_name" {
  type    = string
  default = "med0003-mfe"
}

variable "tf_state_bucket" {
  type    = string
  default = "terraform-locks-105927215604"
}

data "aws_caller_identity" "current" {}

data "aws_route53_zone" "primary" {
  name         = var.root_domain
  private_zone = false
}

# Existing account-level GitHub OIDC provider (shared with MED0001/MED0004).
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

locals {
  mfes_catalog = jsondecode(file("${path.module}/../config/mfes.json"))
  mfes = {
    for mfe in local.mfes_catalog.mfes :
    mfe.name => mfe
  }
  wildcard_domain = "*.${var.mfe_domain_suffix}"
  parent_domain   = var.mfe_domain_suffix
}

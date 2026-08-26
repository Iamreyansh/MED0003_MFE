data "aws_caller_identity" "current" {}

data "aws_route53_zone" "primary" {
  name         = var.root_domain
  private_zone = false
}

data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

locals {
  catalog           = jsondecode(file("${path.module}/../../config/mfes.json"))
  production_suffix = local.catalog.environments.production.domainSuffix
  staging_suffix    = local.catalog.environments.staging.domainSuffix
}

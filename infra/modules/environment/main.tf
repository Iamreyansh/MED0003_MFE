variable "environment" {
  type = string
}

variable "project_name" {
  type = string
}

variable "catalog_path" {
  type = string
}

variable "certificate_arn" {
  type = string
}

variable "hosted_zone_id" {
  type = string
}

variable "allowed_origins" {
  type = list(string)
}

variable "alarm_actions" {
  type    = list(string)
  default = []
}

variable "github_org" {
  type = string
}

variable "github_org_id" {
  type = string
}

variable "github_repo" {
  type = string
}

variable "github_repo_id" {
  type = string
}

variable "oidc_provider_arn" {
  type = string
}

variable "monthly_budget_usd" {
  type    = string
  default = "50"
}

data "aws_caller_identity" "current" {}

module "catalog" {
  source       = "../catalog"
  catalog_path = var.catalog_path
  environment  = var.environment
}

locals {
  github_environment = var.environment
  name_prefix = {
    for name, mfe in module.catalog.mfes :
    name => var.environment == "production" ? "${var.project_name}-${name}" : "${var.project_name}-${var.environment}-${name}"
  }
}

module "site" {
  source   = "../static_site"
  for_each = module.catalog.mfes

  name            = each.value.name
  domain_name     = each.value.domain
  certificate_arn = var.certificate_arn
  hosted_zone_id  = var.hosted_zone_id
  project_name    = var.project_name
  environment     = var.environment
  allowed_origins = var.allowed_origins
  name_prefix     = local.name_prefix[each.key]
  alarm_actions   = var.alarm_actions
}

resource "aws_ssm_parameter" "targets" {
  for_each = module.site

  name = "/medmate/mfe/${var.environment}/${each.key}/targets"
  type = "String"
  value = jsonencode({
    name            = each.key
    environment     = var.environment
    bucket_name     = each.value.bucket_name
    distribution_id = each.value.distribution_id
    domain_name     = each.value.domain_name
    manifest_url    = each.value.manifest_url
  })

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Mfe         = each.key
    ManagedBy   = "terraform"
  }
}

resource "aws_ssm_parameter" "sites" {
  name = "/medmate/mfe/${var.environment}/sites"
  type = "String"
  value = jsonencode({
    for name, site in module.site :
    name => {
      bucket_name     = site.bucket_name
      distribution_id = site.distribution_id
      domain_name     = site.domain_name
      manifest_url    = site.manifest_url
    }
  })

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_budgets_budget" "environment" {
  name         = "${var.project_name}-${var.environment}"
  budget_type  = "COST"
  limit_amount = var.monthly_budget_usd
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  cost_filter {
    name   = "TagKeyValue"
    values = [format("Environment$%s", var.environment)]
  }

  dynamic "notification" {
    for_each = length(var.alarm_actions) > 0 ? [1] : []
    content {
      comparison_operator       = "GREATER_THAN"
      threshold                 = 80
      threshold_type            = "PERCENTAGE"
      notification_type         = "FORECASTED"
      subscriber_sns_topic_arns = var.alarm_actions
    }
  }
}

data "aws_iam_policy_document" "github_assume_deploy" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [var.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "repo:${var.github_org}@${var.github_org_id}/${var.github_repo}@${var.github_repo_id}:environment:${local.github_environment}",
        "repo:${var.github_org}/${var.github_repo}:environment:${local.github_environment}",
      ]
    }
  }
}

resource "aws_iam_role" "github_deploy" {
  name               = "${var.project_name}-github-deploy-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.github_assume_deploy.json

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Purpose     = "deploy"
    ManagedBy   = "terraform"
  }
}

data "aws_iam_policy_document" "github_deploy" {
  statement {
    sid     = "ListBuckets"
    effect  = "Allow"
    actions = ["s3:ListBucket"]
    resources = concat(
      [for site in module.site : site.bucket_arn],
    )
  }

  statement {
    sid     = "WriteObjects"
    effect  = "Allow"
    actions = ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"]
    resources = concat(
      [for site in module.site : "${site.bucket_arn}/*"],
    )
  }

  statement {
    sid       = "InvalidateDistributions"
    effect    = "Allow"
    actions   = ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation", "cloudfront:ListInvalidations"]
    resources = [for site in module.site : site.distribution_arn]
  }

  statement {
    sid    = "ReadWriteTargets"
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:GetParametersByPath",
      "ssm:PutParameter",
    ]
    resources = [
      "arn:aws:ssm:*:${data.aws_caller_identity.current.account_id}:parameter/medmate/mfe/${var.environment}/*",
    ]
  }
}

resource "aws_iam_role_policy" "github_deploy" {
  name   = "${var.project_name}-github-deploy-${var.environment}"
  role   = aws_iam_role.github_deploy.id
  policy = data.aws_iam_policy_document.github_deploy.json
}

output "mfe_sites" {
  value = {
    for name, site in module.site :
    name => {
      bucket_name     = site.bucket_name
      distribution_id = site.distribution_id
      domain_name     = site.domain_name
      manifest_url    = site.manifest_url
    }
  }
}

output "github_deploy_role_arn" {
  value = aws_iam_role.github_deploy.arn
}

output "ssm_sites_parameter" {
  value = aws_ssm_parameter.sites.name
}

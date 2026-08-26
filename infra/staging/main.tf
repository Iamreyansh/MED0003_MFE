variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "project_name" {
  type    = string
  default = "med0003-mfe"
}

variable "portal_origins" {
  type = list(string)
  default = [
    "https://pharmacy.nammamedmate.com",
    "https://pharmacy.staging.nammamedmate.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]
}

variable "monthly_budget_usd" {
  type    = string
  default = "25"
}

data "terraform_remote_state" "shared" {
  backend = "s3"
  config = {
    bucket = "terraform-locks-105927215604"
    key    = "MED0003/shared/terraform.tfstate"
    region = "ap-south-1"
  }
}

module "env" {
  source = "../modules/environment"

  environment         = "staging"
  project_name        = var.project_name
  catalog_path        = "${path.module}/../../config/mfes.json"
  certificate_arn     = data.terraform_remote_state.shared.outputs.staging_certificate_arn
  hosted_zone_id      = data.terraform_remote_state.shared.outputs.hosted_zone_id
  allowed_origins     = var.portal_origins
  alarm_actions       = [data.terraform_remote_state.shared.outputs.alarm_topic_arn]
  github_org          = data.terraform_remote_state.shared.outputs.github_org
  github_org_id       = data.terraform_remote_state.shared.outputs.github_org_id
  github_repo         = data.terraform_remote_state.shared.outputs.github_repo
  github_repo_id      = data.terraform_remote_state.shared.outputs.github_repo_id
  oidc_provider_arn   = data.terraform_remote_state.shared.outputs.oidc_provider_arn
  monthly_budget_usd  = var.monthly_budget_usd
  artifact_bucket_arn = data.terraform_remote_state.shared.outputs.artifact_bucket_arn
}

output "mfe_sites" {
  value = module.env.mfe_sites
}

output "github_deploy_role_arn" {
  value = module.env.github_deploy_role_arn
}

output "ssm_sites_parameter" {
  value = module.env.ssm_sites_parameter
}

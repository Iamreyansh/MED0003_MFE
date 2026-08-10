output "mfe_sites" {
  description = "Per-MFE deployment targets and stable manifest URLs."
  value = {
    for name, site in module.mfe :
    name => {
      bucket_name     = site.bucket_name
      distribution_id = site.distribution_id
      domain_name     = site.domain_name
      manifest_url    = site.manifest_url
    }
  }
}

output "github_actions_role_arn" {
  value = aws_iam_role.github_actions.arn
}

output "github_actions_terraform_role_arn" {
  value = aws_iam_role.github_actions_terraform.arn
}

output "wildcard_certificate_arn" {
  value = aws_acm_certificate.mfe_wildcard.arn
}

output "aws_region" {
  value = var.aws_region
}

output "tf_state_bucket" {
  value = var.tf_state_bucket
}

output "tf_state_key" {
  value = "MED0003/terraform.tfstate"
}

output "tf_lock_prefix" {
  description = "S3 native lockfiles live beside state under this prefix."
  value       = "MED0003/"
}

output "turbo_cache_bucket" {
  description = "Private S3 bucket for Turborepo local cache sync."
  value       = aws_s3_bucket.turbo_cache.bucket
}

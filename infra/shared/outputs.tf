output "artifact_bucket" {
  value = aws_s3_bucket.artifacts.bucket
}

output "artifact_bucket_arn" {
  value = aws_s3_bucket.artifacts.arn
}

output "alarm_topic_arn" {
  value = aws_sns_topic.alarms.arn
}

output "drift_topic_arn" {
  value = aws_sns_topic.drift.arn
}

output "production_certificate_arn" {
  value = aws_acm_certificate_validation.production.certificate_arn
}

output "staging_certificate_arn" {
  value = aws_acm_certificate_validation.staging.certificate_arn
}

output "hosted_zone_id" {
  value = data.aws_route53_zone.primary.zone_id
}

output "oidc_provider_arn" {
  value = data.aws_iam_openid_connect_provider.github.arn
}

output "github_plan_role_arn" {
  value = aws_iam_role.github_plan.arn
}

output "github_apply_staging_role_arn" {
  value = aws_iam_role.github_apply_staging.arn
}

output "github_apply_production_role_arn" {
  value = aws_iam_role.github_apply_production.arn
}

output "github_artifacts_role_arn" {
  value = aws_iam_role.github_artifacts.arn
}

output "github_ci_logs_role_arn" {
  value = aws_iam_role.github_ci_logs.arn
}

output "aws_region" {
  value = var.aws_region
}

output "github_org" {
  value = var.github_org
}

output "github_org_id" {
  value = var.github_org_id
}

output "github_repo" {
  value = var.github_repo
}

output "github_repo_id" {
  value = var.github_repo_id
}

output "project_name" {
  value = var.project_name
}

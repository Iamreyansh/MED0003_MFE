output "bucket_name" {
  value = aws_s3_bucket.assets.bucket
}

output "bucket_arn" {
  value = aws_s3_bucket.assets.arn
}

output "logs_bucket_name" {
  value = aws_s3_bucket.logs.bucket
}

output "distribution_id" {
  value = aws_cloudfront_distribution.assets.id
}

output "distribution_arn" {
  value = aws_cloudfront_distribution.assets.arn
}

output "domain_name" {
  value = var.domain_name
}

output "manifest_url" {
  value = "https://${var.domain_name}/mf-manifest.json"
}

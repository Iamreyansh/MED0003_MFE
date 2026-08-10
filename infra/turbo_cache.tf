# Turborepo local cache bucket (private). CI and developers sync `.turbo/cache`.
resource "aws_s3_bucket" "turbo_cache" {
  bucket = "${var.project_name}-turbo-cache-${data.aws_caller_identity.current.account_id}"

  tags = {
    Project = var.project_name
    Purpose = "turborepo-cache"
  }
}

resource "aws_s3_bucket_public_access_block" "turbo_cache" {
  bucket = aws_s3_bucket.turbo_cache.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "turbo_cache" {
  bucket = aws_s3_bucket.turbo_cache.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "turbo_cache" {
  bucket = aws_s3_bucket.turbo_cache.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "turbo_cache" {
  bucket = aws_s3_bucket.turbo_cache.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "turbo_cache" {
  bucket = aws_s3_bucket.turbo_cache.id

  rule {
    id     = "expire-old-cache"
    status = "Enabled"

    filter {
      prefix = "turbo/"
    }

    expiration {
      days = 30
    }

    noncurrent_version_expiration {
      noncurrent_days = 7
    }
  }

  rule {
    id     = "expire-ci-artifacts"
    status = "Enabled"

    filter {
      prefix = "ci-artifacts/"
    }

    expiration {
      days = 14
    }

    noncurrent_version_expiration {
      noncurrent_days = 3
    }
  }
}

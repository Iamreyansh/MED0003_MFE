# One-time migration from the pre-split monolith state
# (s3://terraform-locks-105927215604/MED0003/terraform.tfstate).
# destroy = false forgets the address without deleting live AWS objects that
# now belong in infra/shared or keep their existing names under module.env.

moved {
  from = module.mfe["todo"]
  to   = module.env.module.site["todo"]
}

removed {
  from = aws_acm_certificate.mfe_wildcard

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_acm_certificate_validation.mfe_wildcard

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_route53_record.mfe_acm_validation

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_iam_role.github_actions

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_iam_role_policy.github_deploy

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_iam_role.github_actions_terraform

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_iam_role_policy.github_terraform

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_s3_bucket.turbo_cache

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_s3_bucket_public_access_block.turbo_cache

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_s3_bucket_ownership_controls.turbo_cache

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_s3_bucket_server_side_encryption_configuration.turbo_cache

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_s3_bucket_versioning.turbo_cache

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_s3_bucket_lifecycle_configuration.turbo_cache

  lifecycle {
    destroy = false
  }
}

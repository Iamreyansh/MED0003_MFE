resource "aws_cloudfront_origin_access_control" "assets" {
  name                              = "${var.name_prefix}-oac"
  description                       = "OAC for ${var.domain_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_response_headers_policy" "cors" {
  name = "${var.name_prefix}-cors"

  cors_config {
    access_control_allow_credentials = false

    access_control_allow_headers {
      items = ["*"]
    }

    access_control_allow_methods {
      items = ["GET", "HEAD", "OPTIONS"]
    }

    access_control_allow_origins {
      items = var.allowed_origins
    }

    access_control_expose_headers {
      items = ["ETag"]
    }

    access_control_max_age_sec = 600
    origin_override            = true
  }

  security_headers_config {
    content_type_options {
      override = true
    }

    frame_options {
      frame_option = "SAMEORIGIN"
      override     = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }

    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }
  }
}

# AWS managed policies (account-wide, no custom-quota use). Custom policies
# per MFE exhausted the account Cache Policies limit (20) once catalogue and
# inventory were added. Origin Cache-Control from scripts/release.sh still
# governs TTL: hashed assets max-age=31536000, manifests max-age=0.
# https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html
data "aws_cloudfront_cache_policy" "immutable" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_cache_policy" "manifest" {
  name = "Managed-CachingDisabled"
}

resource "aws_cloudfront_distribution" "assets" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name} ${var.environment} ${var.name} MFE"
  aliases             = [var.domain_name]
  price_class         = "PriceClass_200"
  default_root_object = "index.html"
  wait_for_deployment = true
  tags                = local.common_tags

  origin {
    domain_name              = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id                = "s3-${var.name}"
    origin_access_control_id = aws_cloudfront_origin_access_control.assets.id
  }

  default_cache_behavior {
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    target_origin_id           = "s3-${var.name}"
    viewer_protocol_policy     = "redirect-to-https"
    compress                   = true
    cache_policy_id            = data.aws_cloudfront_cache_policy.immutable.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.cors.id
  }

  ordered_cache_behavior {
    path_pattern               = "/mf-manifest.json"
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    target_origin_id           = "s3-${var.name}"
    viewer_protocol_policy     = "redirect-to-https"
    compress                   = true
    cache_policy_id            = data.aws_cloudfront_cache_policy.manifest.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.cors.id
  }

  ordered_cache_behavior {
    path_pattern               = "/remoteEntry.js"
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    target_origin_id           = "s3-${var.name}"
    viewer_protocol_policy     = "redirect-to-https"
    compress                   = true
    cache_policy_id            = data.aws_cloudfront_cache_policy.manifest.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.cors.id
  }

  ordered_cache_behavior {
    path_pattern               = "/release.json"
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    target_origin_id           = "s3-${var.name}"
    viewer_protocol_policy     = "redirect-to-https"
    compress                   = true
    cache_policy_id            = data.aws_cloudfront_cache_policy.manifest.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.cors.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

data "aws_iam_policy_document" "assets_oac" {
  statement {
    sid     = "AllowCloudFrontOAC"
    effect  = "Allow"
    actions = ["s3:GetObject"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    resources = ["${aws_s3_bucket.assets.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.assets.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "assets" {
  bucket = aws_s3_bucket.assets.id
  policy = data.aws_iam_policy_document.assets_oac.json
}

resource "aws_route53_record" "ipv4" {
  zone_id = var.hosted_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.assets.domain_name
    zone_id                = aws_cloudfront_distribution.assets.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "ipv6" {
  zone_id = var.hosted_zone_id
  name    = var.domain_name
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.assets.domain_name
    zone_id                = aws_cloudfront_distribution.assets.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_cloudwatch_metric_alarm" "origin_5xx" {
  alarm_name          = "${var.name_prefix}-5xx"
  alarm_description   = "CloudFront 5xx rate for ${var.domain_name}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "5xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = 300
  statistic           = "Average"
  threshold           = 5
  treat_missing_data  = "notBreaching"
  alarm_actions       = var.alarm_actions
  ok_actions          = var.alarm_actions

  dimensions = {
    DistributionId = aws_cloudfront_distribution.assets.id
    Region         = "Global"
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "origin_4xx" {
  alarm_name          = "${var.name_prefix}-4xx"
  alarm_description   = "CloudFront 4xx rate for ${var.domain_name}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "4xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = 300
  statistic           = "Average"
  threshold           = 25
  treat_missing_data  = "notBreaching"
  alarm_actions       = var.alarm_actions
  ok_actions          = var.alarm_actions

  dimensions = {
    DistributionId = aws_cloudfront_distribution.assets.id
    Region         = "Global"
  }

  tags = local.common_tags
}

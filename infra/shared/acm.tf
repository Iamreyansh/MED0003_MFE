resource "aws_acm_certificate" "production" {
  provider = aws.us_east_1

  domain_name               = local.production_suffix
  subject_alternative_names = ["*.${local.production_suffix}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Purpose = "mfe-production-cdn"
  }
}

resource "aws_acm_certificate" "staging" {
  provider = aws.us_east_1

  domain_name               = local.staging_suffix
  subject_alternative_names = ["*.${local.staging_suffix}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Purpose = "mfe-staging-cdn"
  }
}

resource "aws_route53_record" "production_acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.production.domain_validation_options :
    dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.primary.zone_id
}

resource "aws_route53_record" "staging_acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.staging.domain_validation_options :
    dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.primary.zone_id
}

resource "aws_acm_certificate_validation" "production" {
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.production.arn
  validation_record_fqdns = [for record in aws_route53_record.production_acm_validation : record.fqdn]
}

resource "aws_acm_certificate_validation" "staging" {
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.staging.arn
  validation_record_fqdns = [for record in aws_route53_record.staging_acm_validation : record.fqdn]
}

resource "aws_acm_certificate" "mfe_wildcard" {
  provider = aws.us_east_1

  domain_name               = local.parent_domain
  subject_alternative_names = [local.wildcard_domain]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Project = var.project_name
  }
}

resource "aws_route53_record" "mfe_acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.mfe_wildcard.domain_validation_options :
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

resource "aws_acm_certificate_validation" "mfe_wildcard" {
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.mfe_wildcard.arn
  validation_record_fqdns = [for record in aws_route53_record.mfe_acm_validation : record.fqdn]
}

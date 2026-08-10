module "mfe" {
  source   = "./modules/static_site"
  for_each = local.mfes

  name            = each.value.name
  domain_name     = each.value.domain
  certificate_arn = aws_acm_certificate_validation.mfe_wildcard.certificate_arn
  hosted_zone_id  = data.aws_route53_zone.primary.zone_id
  project_name    = var.project_name
  allowed_origins = var.portal_origins
}

variable "catalog_path" {
  type = string
}

variable "environment" {
  type = string

  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "environment must be staging or production."
  }
}

locals {
  catalog = jsondecode(file(var.catalog_path))
  suffix  = local.catalog.environments[var.environment].domainSuffix
  mfes = {
    for mfe in local.catalog.mfes :
    mfe.name => merge(mfe, {
      domain = var.environment == "production" ? mfe.domain : "${mfe.name}.${local.suffix}"
    })
  }
}

output "mfes" {
  value = local.mfes
}

output "domain_suffix" {
  value = local.suffix
}

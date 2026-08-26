variable "name" {
  type = string
}

variable "domain_name" {
  type = string
}

variable "certificate_arn" {
  type = string
}

variable "hosted_zone_id" {
  type = string
}

variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "allowed_origins" {
  type = list(string)
}

variable "name_prefix" {
  description = "Stable AWS resource prefix. Production keeps legacy names."
  type        = string
}

variable "alarm_actions" {
  type    = list(string)
  default = []
}

data "aws_caller_identity" "current" {}

locals {
  bucket_name = "${var.name_prefix}-${data.aws_caller_identity.current.account_id}"
  logs_name   = "${var.name_prefix}-logs-${data.aws_caller_identity.current.account_id}"
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    Mfe         = var.name
    ManagedBy   = "terraform"
  }
}

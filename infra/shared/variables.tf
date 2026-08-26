variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "root_domain" {
  type    = string
  default = "nammamedmate.com"
}

variable "project_name" {
  type    = string
  default = "med0003-mfe"
}

variable "github_org" {
  type    = string
  default = "Iamreyansh"
}

variable "github_org_id" {
  type    = string
  default = "43453546"
}

variable "github_repo" {
  type    = string
  default = "MED0003_MFE"
}

variable "github_repo_id" {
  type    = string
  default = "1309167446"
}

variable "tf_state_bucket" {
  type    = string
  default = "terraform-locks-105927215604"
}

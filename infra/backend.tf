terraform {
  backend "s3" {
    bucket       = "terraform-locks-105927215604"
    key          = "MED0003/terraform.tfstate"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true
  }
}

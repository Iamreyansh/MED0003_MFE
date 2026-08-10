# AWS bootstrap

Account: `105927215604` · Region: `ap-south-1` · Zone: `nammamedmate.com`

## Prerequisites

Use a **dedicated IAM admin/bootstrap profile** (not account root).

```bash
aws sts get-caller-identity --profile <bootstrap>
# Arn must NOT end with :root
```

## Apply MED0003 stack

```bash
cd infra
export AWS_PROFILE=<bootstrap>
terraform init
terraform plan
terraform apply
terraform output -json mfe_sites
```

## GitHub configuration

Create Environments: `production`, `terraform`.

Secrets:

- `AWS_ROLE_ARN` ← `github_actions_role_arn`
- `AWS_TF_ROLE_ARN` ← `github_actions_terraform_role_arn`

Variables:

- `AWS_REGION=ap-south-1`
- `MFE_SITES_JSON` ← JSON object from `terraform output -json mfe_sites`

## Domains created

- Wildcard cert: `*.mfe.nammamedmate.com` (+ apex `mfe.nammamedmate.com`)
- Per MFE: e.g. `todo.mfe.nammamedmate.com`

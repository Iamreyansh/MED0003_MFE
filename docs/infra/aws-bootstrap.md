# AWS bootstrap

Account: `105927215604` · Region: `ap-south-1` · Zone: `nammamedmate.com`

## Prerequisites

Use a **dedicated IAM admin/bootstrap profile** (not account root).

```bash
aws sts get-caller-identity --profile medmate-bootstrap
# Expected: arn:aws:iam::105927215604:user/medmate-bootstrap
```

## Terraform state & locks (S3)

Backend (`infra/backend.tf`):

| Setting   | Value                                                    |
| --------- | -------------------------------------------------------- |
| Bucket    | `terraform-locks-105927215604`                           |
| State key | `MED0003/terraform.tfstate`                              |
| Locking   | S3 native `use_lockfile = true` (`.tflock` beside state) |

Provider lockfile stays in git (`infra/.terraform.lock.hcl`) and can be backed up:

```bash
pnpm tf:lock:backup
# → s3://terraform-locks-105927215604/MED0003/.terraform.lock.hcl
```

## Apply MED0003 stack

```bash
cd infra
export AWS_PROFILE=medmate-bootstrap
terraform init
terraform plan
terraform apply
terraform output -json mfe_sites
terraform output -raw turbo_cache_bucket
```

## GitHub configuration

Preferred: Environments `production` and `terraform` (requires repo admin).

If Environments are unavailable, repository secrets/variables work with the current OIDC trust (main-branch subjects are allowed).

Secrets:

- `AWS_ROLE_ARN` ← `github_actions_role_arn`
- `AWS_TF_ROLE_ARN` ← `github_actions_terraform_role_arn`

Variables:

- `AWS_REGION=ap-south-1`
- `MFE_SITES_JSON` ← JSON object from `terraform output -json mfe_sites`
- `TURBO_CACHE_BUCKET` ← `terraform output -raw turbo_cache_bucket`

## Domains created

- Wildcard cert: `*.mfe.nammamedmate.com` (+ apex `mfe.nammamedmate.com`)
- Per MFE: e.g. `todo.mfe.nammamedmate.com`
- Turbo cache bucket: `med0003-mfe-turbo-cache-<account>`

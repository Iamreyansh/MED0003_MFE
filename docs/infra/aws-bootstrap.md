# AWS bootstrap

Account: `105927215604` · Region: `ap-south-1` · Zone: `nammamedmate.com`

## One-time admin steps

These are the only manual steps. After they exist, CI applies Terraform and deploys remotes.

1. Dedicated IAM bootstrap profile (not account root).
2. Existing OIDC provider `token.actions.githubusercontent.com`.
3. State bucket `terraform-locks-105927215604` with versioning, encryption, public access block, and native lockfiles.
4. GitHub Environments `staging` and `production` (production required reviewers).
5. First apply of `infra/shared` from a trusted admin or `workflow_dispatch` (creates roles, ACM, artifact bucket, SNS).

```bash
aws sts get-caller-identity --profile medmate-bootstrap
cd infra/shared && terraform init && terraform apply
cd ../staging && terraform init && terraform apply
```

Do not apply production until staging smoke and PDT have passed for the same git SHA.

## GitHub secrets and variables

Secrets (from Terraform outputs):

| Secret                             | Output                              |
| ---------------------------------- | ----------------------------------- |
| `AWS_TF_PLAN_ROLE_ARN`             | `github_plan_role_arn` (shared)     |
| `AWS_TF_APPLY_STAGING_ROLE_ARN`    | `github_apply_staging_role_arn`     |
| `AWS_TF_APPLY_PRODUCTION_ROLE_ARN` | `github_apply_production_role_arn`  |
| `AWS_ARTIFACTS_ROLE_ARN`           | `github_artifacts_role_arn`         |
| `AWS_CI_LOGS_ROLE_ARN`             | `github_ci_logs_role_arn`           |
| `AWS_DEPLOY_STAGING_ROLE_ARN`      | staging `github_deploy_role_arn`    |
| `AWS_DEPLOY_PRODUCTION_ROLE_ARN`   | production `github_deploy_role_arn` |

Variables:

| Variable          | Value                    |
| ----------------- | ------------------------ |
| `AWS_REGION`      | `ap-south-1`             |
| `ARTIFACT_BUCKET` | shared `artifact_bucket` |

Do not set `MFE_SITES_JSON`. Deploy jobs read SSM.

GitHub Actions artifact storage is not used. The artifact bucket holds:

| Prefix                         | Purpose                               | Retention  |
| ------------------------------ | ------------------------------------- | ---------- |
| `releases/<sha>/<mfe>/`        | Immutable MFE build payloads          | long-lived |
| `tfplans/<sha>/<stack>/<run>/` | Checksummed Terraform plans           | 14 days    |
| `ci-logs/<sha>/<run>/<label>/` | Coverage, Playwright, PDT diagnostics | 14 days    |

## Break-glass state recovery

Never force-unlock from CI. If a lock is stuck:

1. Confirm no apply is running.
2. Inspect the `.tflock` object beside state.
3. An admin removes the lock object only after that confirmation.
4. Re-run plan, then apply the new checksummed plan.

## State split

Production keeps the historic state key `MED0003/terraform.tfstate`. Use `scripts/tf-migrate-state.sh` as the operator checklist when moving ACM/IAM into shared and renaming `module.mfe` to `module.env.module.site`.

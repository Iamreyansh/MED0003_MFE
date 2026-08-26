#!/usr/bin/env bash
# One-time operator script: split the legacy MED0003 state into shared + production.
# Does not run automatically. Review each command before executing.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cat <<'EOF'
State migration (run from a trusted admin workstation):

1. terraform -chdir=infra/shared init
2. terraform -chdir=infra/shared import of ACM / IAM / artifacts as needed
   (new resources can be applied instead of imported).
3. Copy the existing state key MED0003/terraform.tfstate (already used by
   infra/production) and migrate MFE module addresses:

   cd infra/production
   terraform init
   terraform state mv 'module.mfe["todo"]' 'module.env.module.site["todo"]'

4. Remove account-level resources that now live in shared:

   terraform state rm aws_acm_certificate.mfe_wildcard
   terraform state rm aws_acm_certificate_validation.mfe_wildcard
   terraform state rm aws_iam_role.github_actions
   terraform state rm aws_iam_role.github_actions_terraform
   terraform state rm aws_s3_bucket.turbo_cache

   Only remove addresses that still exist in the production state.

5. terraform -chdir=infra/staging init && plan && apply
6. Deploy Todo to staging, run smoke + PDT, then apply production.

Never force-unlock state automatically. If a lock is stuck, follow
docs/infra/aws-bootstrap.md.
EOF

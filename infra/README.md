# Infrastructure

MED0003 Terraform is split into three isolated roots. Do not use workspaces.

| Stack      | Path               | State key                           | Apply gate                          |
| ---------- | ------------------ | ----------------------------------- | ----------------------------------- |
| Shared     | `infra/shared`     | `MED0003/shared/terraform.tfstate`  | Staging GitHub Environment          |
| Staging    | `infra/staging`    | `MED0003/staging/terraform.tfstate` | Staging GitHub Environment          |
| Production | `infra/production` | `MED0003/terraform.tfstate`         | Production GitHub Environment + PDT |

`config/mfes.json` is the only catalog. Staging domains are `<name>.staging.mfe.nammamedmate.com`. Production domains stay `<name>.mfe.nammamedmate.com`.

Deploy targets are published to SSM `/medmate/mfe/<environment>/<name>/targets`. GitHub Actions never copies `MFE_SITES_JSON`.

## Commands

```bash
pnpm tf:fmt
pnpm tf:init
pnpm tf:test
./scripts/tf.sh plan staging
./scripts/tf.sh policy infra/staging/tfplan.json staging
./scripts/tf.sh apply staging
```

Plans are checksummed and applied exactly. A second plan after apply must show zero drift. Binary plans are stored under `s3://$ARTIFACT_BUCKET/tfplans/` — not GitHub Actions artifacts.

`.terraform.lock.hcl` and the provider plugin cache are not in git. CI and local `./scripts/tf.sh plan` pull them from `s3://terraform-locks-105927215604/MED0003/`. After a provider version change run `pnpm tf:lock:refresh`.

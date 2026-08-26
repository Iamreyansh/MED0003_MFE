# Deploy & rollback

Remotes are built once per git SHA, stored in the artifact bucket, promoted to staging, verified, then promoted to production as the same bytes.

```text
classify affected MFEs
  → apply shared/staging Terraform
  → matrix build + package + checksum
  → matrix staging promote
  → matrix staging smoke + matrix staging PDT
  → staging-gate (every leg must succeed)
  → production environment approval
  → apply production Terraform
  → matrix production promote + smoke
```

Production jobs declare a fail-closed dependency on the aggregate staging gate. A skipped, cancelled, timed-out, or failed smoke or PDT matrix leg blocks production.

## Staging verification

- **Smoke** (`./scripts/release.sh smoke`): manifest, `remoteEntry.js`, referenced chunks, CORS/HSTS, `release.json` SHA.
- **PDT** (`./scripts/release.sh pdt`): Playwright specs against `https://<name>.staging.mfe.nammamedmate.com` with `PDT_BASE_URL` (no local webServer).

Matrix `fail-fast: false` so every affected MFE reports. The gate still fails unless every leg succeeded.

## Rollback

GitHub → Actions → **Rollback MFE** → environment, MFE name, previous SHA.

This pulls the immutable artifact and runs `./scripts/release.sh promote` (full dist, not manifest-only). Failed production smoke automatically restores the previous known-good SHA from SSM and still fails the workflow.

## CI

PR workflow `.github/workflows/ci.yml` is the quality gate. The required check name is `ci-success`. Release workflow does not re-run lint/unit/e2e.

Failure diagnostics (coverage, Playwright traces, PDT reports) and Terraform plans are stored in the private S3 artifact bucket. GitHub Actions artifact storage is not used.

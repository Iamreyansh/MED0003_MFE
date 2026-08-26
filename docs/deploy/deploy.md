# Deploy & rollback

## Deploy path

1. Build remotes → repo-root `dist/<name>/`
2. Upload immutable objects to `s3://<bucket>/releases/<git-sha>/`
3. Promote root `mf-manifest.json` + `remoteEntry.js` (no-cache)
4. Invalidate CloudFront paths `/mf-manifest.json`, `/remoteEntry.js`, `/current/*`
5. **Post-deploy smoke** via `scripts/post-deploy-smoke.sh` (manifest + remoteEntry)

Host apps keep a stable env var and do not need redeploy when only remotes change.

## CI

- Separate jobs: **format**, **lint**, **test**, **build**
- Deploy uses a **matrix** over affected MFEs from `scripts/affected-mfes.sh`
- Each deploy job is followed by a matrix **post-deploy** smoke job

## Turbo cache (S3)

```bash
export TURBO_CACHE_BUCKET="$(terraform -chdir=infra output -raw turbo_cache_bucket)"
pnpm cache:pull   # before local/CI builds
pnpm cache:push   # after successful builds
```

## Rollback

GitHub → Actions → **Rollback MFE** → provide `mfe` + previous `git_sha`.

This copies `/releases/<sha>/mf-manifest.json` back to the bucket root and invalidates CDN.

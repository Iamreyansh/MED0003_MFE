# Deploy & rollback

## Deploy path

1. Build package → `dist/`
2. Upload immutable objects to `s3://<bucket>/releases/<git-sha>/`
3. Promote root `mf-manifest.json` + `remoteEntry.js` (no-cache)
4. Invalidate CloudFront paths `/mf-manifest.json`, `/remoteEntry.js`, `/current/*`
5. Smoke-check `https://<name>.mfe.nammamedmate.com/mf-manifest.json`

Host apps keep a stable env var and do not need redeploy when only remotes change.

## Rollback

GitHub → Actions → **Rollback MFE** → provide `mfe` + previous `git_sha`.

This copies `/releases/<sha>/mf-manifest.json` back to the bucket root and invalidates CDN.

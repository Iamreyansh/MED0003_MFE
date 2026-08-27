# Host integration checklist — settings

After Terraform provisions this remote, register it in MED0002_PharmacyPortal:

1. Set `VITE_MFE_DOMAIN_SUFFIX=mfe.nammamedmate.com` (staging: `staging.mfe.nammamedmate.com`). The host resolves `https://settings.<suffix>/mf-manifest.json`. Optional override: `VITE_REMOTE_SETTINGS_URL`.
2. Add a `REMOTE_REGISTRY` entry: name `settings`, module `./Mfe`, routes `/settings/profile` and `/settings/storefront`.
3. Add a thin page adapter that builds an `MfeDataEnvelope` with `@medmate/settings-contract` and mounts `RemoteLoader`.
4. Wire `/settings/profile` and `/settings/storefront` from the registry (do not hardcode strings in nav).
5. Keep Playwright coverage in `apps/settings/e2e` and extend the host suite in MED0002.

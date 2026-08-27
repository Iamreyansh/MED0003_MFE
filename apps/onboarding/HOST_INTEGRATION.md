# Host integration checklist — onboarding

After Terraform provisions this remote, register it in MED0002_PharmacyPortal:

1. Set `VITE_MFE_DOMAIN_SUFFIX=mfe.nammamedmate.com` (staging: `staging.mfe.nammamedmate.com`). The host resolves `https://onboarding.<suffix>/mf-manifest.json`. Optional override: `VITE_REMOTE_ONBOARDING_URL`.
2. Add a `REMOTE_REGISTRY` entry: name `onboarding`, module `./Mfe`, route `/onboarding`.
3. Add a thin page adapter that builds an `MfeDataEnvelope` and mounts `RemoteLoader`.
4. Wire the route/nav from the registry (do not hardcode strings).
5. Keep Playwright coverage in `apps/onboarding/e2e` and extend the host suite in MED0002.

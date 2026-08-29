# Host integration checklist — subscription

After Terraform provisions this remote, register it in MED0002_PharmacyPortal:

1. Set `VITE_REMOTE_SUBSCRIPTION_URL=https://subscription.mfe.nammamedmate.com/mf-manifest.json`.
2. Add a `REMOTE_REGISTRY` entry: name `subscription`, module `./Mfe`, route `/subscription`.
3. Add a thin page adapter that builds an `MfeDataEnvelope` and mounts `RemoteLoader`.
4. Wire the route/nav from the registry (do not hardcode strings).
5. Keep Playwright coverage in `apps/subscription/e2e` and extend the host suite in MED0002.

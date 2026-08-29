# Host integration checklist — catalogue

After Terraform provisions this remote, register it in MED0002_PharmacyPortal:

1. Set `VITE_REMOTE_CATALOGUE_URL=https://catalogue.mfe.nammamedmate.com/mf-manifest.json`.
2. Add a `REMOTE_REGISTRY` entry: name `catalogue`, module `./Mfe`, route `/catalogue`.
3. Add a thin page adapter that builds an `MfeDataEnvelope` and mounts `RemoteLoader`.
4. Wire the route/nav from the registry (do not hardcode strings).
5. Keep Playwright coverage in `apps/catalogue/e2e` and extend the host suite in MED0002.

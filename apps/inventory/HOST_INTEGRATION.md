# Host integration checklist — inventory

After Terraform provisions this remote, register it in MED0002_PharmacyPortal:

1. Set `VITE_REMOTE_INVENTORY_URL=https://inventory.mfe.nammamedmate.com/mf-manifest.json`.
2. Add a `REMOTE_REGISTRY` entry: name `inventory`, module `./Mfe`, route `/inventory`.
3. Add a thin page adapter that builds an `MfeDataEnvelope` and mounts `RemoteLoader`.
4. Wire the route/nav from the registry (do not hardcode strings).
5. Keep Playwright coverage in `apps/inventory/e2e` and extend the host suite in MED0002.

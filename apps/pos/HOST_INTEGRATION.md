# Host integration checklist — POS

After Terraform provisions this remote, register it in MED0002_PharmacyPortal:

1. Set `VITE_REMOTE_POS_URL=https://pos.mfe.nammamedmate.com/mf-manifest.json`.
2. Add a `REMOTE_REGISTRY` entry: name `pos`, module `./Mfe`, route `/pos`.
3. Add a thin page adapter that builds an `MfeDataEnvelope` and mounts `RemoteLoader`.
4. Keep `cartId` in host memory. Do not put it on a public share URL.
5. Keep Playwright coverage in `apps/pos/e2e` and extend the host suite in MED0002.

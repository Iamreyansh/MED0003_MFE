# Host integration checklist — billing

After Terraform provisions this remote, register it in MED0002_PharmacyPortal:

1. Set `VITE_REMOTE_BILLING_URL=https://billing.mfe.nammamedmate.com/mf-manifest.json`.
2. Add a `REMOTE_REGISTRY` entry: name `billing`, module `./Mfe`, route `/invoices`.
3. Add a thin page adapter that builds an `MfeDataEnvelope` and mounts `RemoteLoader`.
4. Wire `/invoices`, `/invoices/:invoiceId`, `/invoice-settings`, and `/sales`.
5. Keep Playwright coverage in `apps/billing/e2e` and extend the host suite in MED0002.

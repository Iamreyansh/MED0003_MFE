# `Billing` MFE

- Domain: `https://billing.mfe.nammamedmate.com`
- Standalone: `pnpm --filter @medmate/billing dev`
- Federated expose: `./Mfe` via `src/entrypoints/remote.tsx`
- Playwright: `apps/billing/e2e`

## Layout

```
src/
  entrypoints/          # federated remote + standalone harness
  app/                  # contract validation + providers
  layouts/              # domain layout only
  lib/                  # copy and dialog helpers
  ui/                   # invoices, invoice-detail, invoice-settings, sales
  contract.ts
e2e/                    # Playwright config, specs, mocks
```

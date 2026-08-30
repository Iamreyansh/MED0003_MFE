# `Inventory` MFE

- Domain: `https://inventory.mfe.nammamedmate.com`
- Standalone: `pnpm --filter @medmate/inventory dev`
- Federated expose: `./Mfe` via `src/entrypoints/remote.tsx`
- Playwright: `apps/inventory/e2e`

## Layout

```
src/
  entrypoints/          # federated remote + standalone harness
  app/                  # contract validation + providers
  layouts/              # domain layout only
  features/inventory/    # api, model, lib (no UI)
  ui/                   # presentational components
  contract.ts
e2e/                    # Playwright config, specs, mocks
```

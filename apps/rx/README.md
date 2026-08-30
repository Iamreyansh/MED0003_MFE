# `Rx` MFE

- Domain: `https://rx.mfe.nammamedmate.com`
- Standalone: `pnpm --filter @medmate/rx dev`
- Federated expose: `./Mfe` via `src/entrypoints/remote.tsx`
- Playwright: `apps/rx/e2e`

## Layout

```
src/
  entrypoints/          # federated remote + standalone harness
  app/                  # contract validation + providers
  layouts/              # domain layout only
  features/rx/    # api, model, lib (no UI)
  ui/                   # presentational components
  contract.ts
e2e/                    # Playwright config, specs, mocks
```

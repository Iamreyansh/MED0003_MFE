# `Onboarding` MFE

- Domain: `https://onboarding.mfe.nammamedmate.com`
- Standalone: `pnpm --filter @medmate/onboarding dev`
- Federated expose: `./Mfe` via `src/entrypoints/remote.tsx`
- Playwright: `apps/onboarding/e2e`

## Layout

```
src/
  entrypoints/          # federated remote + standalone harness
  app/                  # contract validation + providers
  layouts/              # domain layout only
  features/onboarding/    # api, model, lib (no UI)
  ui/                   # presentational components
  contract.ts
e2e/                    # Playwright config, specs, mocks
```

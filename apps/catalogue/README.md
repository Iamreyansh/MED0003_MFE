# `Catalogue` MFE

- Domain: `https://catalogue.mfe.nammamedmate.com`
- Standalone: `pnpm --filter @medmate/catalogue dev`
- Federated expose: `./Mfe` via `src/entrypoints/remote.tsx`
- Screens: `search` (`/catalogue`) and `mapping` (`/catalogue/mapping`)
- Playwright: `apps/catalogue/e2e`

Hosts pass `data.feature.screen` and `data.feature.onSubmit`. Tokens stay on the host.

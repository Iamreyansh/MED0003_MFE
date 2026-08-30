# `Procurement` MFE

- Domain: `https://procurement.mfe.nammamedmate.com`
- Standalone: `pnpm --filter @medmate/procurement dev`
- Federated expose: `./Mfe` via `src/entrypoints/remote.tsx`
- Playwright: `apps/procurement/e2e`

## Layout

```
src/
  entrypoints/          # federated remote + standalone harness
  app/                  # contract validation + providers
  layouts/              # domain layout only
  lib/                  # copy and dialog helpers
  ui/                   # purchases, editor, distributors, reorder
  contract.ts
e2e/                    # Playwright config, specs, mocks
```

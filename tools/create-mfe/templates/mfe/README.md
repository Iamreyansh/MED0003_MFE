# `__TITLE__` MFE

- Domain: `https://__DOMAIN__`
- Standalone: `pnpm --filter __PACKAGE__ dev`
- Federated expose: `./Mfe` via `src/entrypoints/remote.tsx`
- Playwright: `apps/__NAME__/e2e`

## Layout

```
src/
  entrypoints/          # federated remote + standalone harness
  app/                  # contract validation + providers
  layouts/              # domain layout only
  features/__NAME__/    # api, model, lib (no UI)
  ui/                   # presentational components
  contract.ts
e2e/                    # Playwright config, specs, mocks
```

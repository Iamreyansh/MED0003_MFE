# Todo MFE

- Domain: `https://todo.mfe.nammamedmate.com`
- Standalone: `pnpm --filter @medmate/todo dev`
- Federated expose: `./Mfe` via `src/entrypoints/remote.tsx`
- Playwright: `pnpm --filter @medmate/todo test:e2e`

## Layout

```
src/
  entrypoints/    # federated remote + standalone harness
  app/            # contract validation + providers
  layouts/        # domain layout only
  features/todos/ # api, model, lib
  ui/             # presentational components
  contract.ts
e2e/              # Playwright config, specs, mocks
```

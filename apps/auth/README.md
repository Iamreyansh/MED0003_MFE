# Auth MFE

- Domain: `https://auth.mfe.nammamedmate.com`
- Standalone: `pnpm --filter @medmate/auth dev`
- Federated expose: `./Mfe` via `src/entrypoints/remote.tsx`
- Playwright: `pnpm --filter @medmate/auth test:e2e`

Hosts pass `data.feature.portalType` and `data.feature.onSubmit`. Tokens stay in the host.

```
src/
  entrypoints/    # federated remote + standalone harness
  app/            # contract validation
  layouts/        # AuthShell
  features/auth/  # submit helpers
  lib/            # copy, schemas, motion
  ui/             # screens
  contract.ts
```

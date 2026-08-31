# `Settings` MFE

- Domain: `https://settings.mfe.nammamedmate.com`
- Standalone: `pnpm --filter @medmate/settings dev`
- Federated expose: `./Mfe` via `src/entrypoints/remote.tsx`
- Playwright: `apps/settings/e2e`
- Screens: profile (`/settings/profile`), storefront (`/settings/storefront`),
  roles (`/settings/roles`), notifications (`/settings/notifications`)

Host owns HTTP via `feature.onSubmit`. This remote never reads tokens.

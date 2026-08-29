# `Subscription` MFE

- Domain: `https://subscription.mfe.nammamedmate.com`
- Standalone: `pnpm --filter @medmate/subscription dev`
- Federated expose: `./Mfe` via `src/entrypoints/remote.tsx`
- Screens: `plans` (`/subscription`) and `billing` (`/billing`)
- Playwright: `apps/subscription/e2e`

Hosts pass `data.feature.screen` and `data.feature.onSubmit`. Tokens stay on the host.

# `Finance` MFE

- Domain: `https://finance.mfe.nammamedmate.com`
- Standalone: `pnpm --filter @medmate/finance dev`
- Federated expose: `./Mfe` via `src/entrypoints/remote.tsx`
- Playwright: `apps/finance/e2e`

## Screens

- `settlements` — owner-only payout history (GET list)
- `settlement-detail` — read-only Core fields and support CTA

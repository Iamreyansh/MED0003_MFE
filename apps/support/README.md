# `Support` MFE

- Domain: `https://support.mfe.nammamedmate.com`
- Standalone: `pnpm --filter @medmate/support dev`
- Federated expose: `./Mfe` via `src/entrypoints/remote.tsx`
- Playwright: `apps/support/e2e`

## Screens

- `ticket-new` — create a pharmacy ticket (no inbox)
- `ticket-detail` — GET by id, reply, CSAT, reopen
- `help` — public help catalogue
- `help-article` — article text and deflection

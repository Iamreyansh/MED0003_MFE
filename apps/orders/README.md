# `Orders` MFE

- Domain: `https://orders.mfe.nammamedmate.com`
- Standalone: `pnpm --filter @medmate/orders dev`
- Federated expose: `./Mfe` via `src/entrypoints/remote.tsx`
- Playwright: `apps/orders/e2e`

## Screens

- `rx-quotes` — quote queue, quote form, decline
- `orders-home` — guidance only (no inbox GET)
- `order-actions` — accept, reject, status, assign rider by id

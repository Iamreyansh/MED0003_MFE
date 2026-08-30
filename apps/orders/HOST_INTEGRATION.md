# Host integration checklist — orders

Host registry already includes `orders` → `/rx-quotes` and `/orders`.

1. Set `VITE_REMOTE_ORDERS_URL` or serve local dist at `/__mfe/orders/mf-manifest.json`.
2. Mount `OrdersRemotePage` for `/rx-quotes`, `/orders`, and `/orders/:orderId`.
3. Keep Playwright coverage in `apps/orders/e2e` and host `e2e/orders-federation.spec.ts`.

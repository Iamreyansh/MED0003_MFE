# Host integration checklist — finance

Host registry includes `finance` → `/finance/settlements`.

1. Set `VITE_REMOTE_FINANCE_URL` or serve local dist at `/__mfe/finance/mf-manifest.json`.
2. Mount `FinanceRemotePage` for `/finance/settlements` and `/finance/settlements/:id`.
3. Keep Playwright coverage in `apps/finance/e2e` and host `e2e/finance-federation.spec.ts`.

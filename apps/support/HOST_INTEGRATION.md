# Host integration checklist — support

Host registry includes `support` → `/help` and `/support`.

1. Set `VITE_REMOTE_SUPPORT_URL` or serve local dist at `/__mfe/support/mf-manifest.json`.
2. Mount `SupportRemotePage` for `/support/new`, `/support/tickets/:id`, `/help`, and `/help/articles/:id`.
3. Keep Playwright coverage in `apps/support/e2e` and host `e2e/support-federation.spec.ts`.

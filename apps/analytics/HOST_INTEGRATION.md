# Host integration checklist — analytics

Host registry includes `analytics` → `/analytics`.

1. Set `VITE_REMOTE_ANALYTICS_URL` or serve local dist at `/__mfe/analytics/mf-manifest.json`.
2. Mount `AnalyticsRemotePage` for `/analytics`.
3. Keep Playwright coverage in `apps/analytics/e2e` and host `e2e/analytics-federation.spec.ts`.

# Local development

## Run Todo alone

```bash
pnpm install
pnpm --filter @medmate/todo dev
# http://localhost:5101
```

## Run with PharmacyPortal host

Terminal A (this repo):

```bash
pnpm --filter @medmate/todo dev
```

Terminal B (`MED0002_PharmacyPortal`):

```bash
cp .env.example .env
# set VITE_REMOTE_TODO_URL=http://localhost:5101/mf-manifest.json
pnpm install
pnpm dev
```

## Generator

```bash
pnpm create:mfe stock-alerts
pnpm install
pnpm --filter @medmate/stock-alerts dev
```

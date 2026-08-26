# Local development

Install Playwright browsers once after `pnpm install`:

```bash
pnpm exec playwright install chromium
```

## Run Todo alone

```bash
pnpm install
pnpm dev:todo
# http://localhost:5101
```

## Useful root scripts

| Script                      | Purpose                                                       |
| --------------------------- | ------------------------------------------------------------- |
| `pnpm quality`              | validate + format + lint + typecheck + coverage + e2e + build |
| `pnpm test:e2e`             | Playwright suites under `apps/<mfe>/e2e`                      |
| `pnpm create:mfe <name>`    | scaffold a remote                                             |
| `pnpm affected`             | print affected MFE deploy matrix                              |
| `pnpm smoke:mfe <domain>`   | post-deploy smoke                                             |
| `pnpm dev:with-host`        | start Todo + print Portal `.env` snippet                      |
| `pnpm tf:plan` / `tf:apply` | Terraform helpers                                             |

## Run with PharmacyPortal host

Preferred one-liner from this repo:

```bash
pnpm run dev:with-host
```

Or manually — Terminal A (this repo):

```bash
pnpm --filter @medmate/todo dev
```

Terminal B (`MED0002_PharmacyPortal`, sibling checkout):

```bash
cp .env.example .env
# set VITE_REMOTE_TODO_URL=http://localhost:5101/mf-manifest.json
pnpm install
pnpm dev
```

## Optional Redux in an MFE

```ts
import {
  createMfeStore,
  createMfeStoreHooks,
  MfeStoreProvider,
} from '@medmate/mfe-kit';
```

See `apps/todo/src/features/todos/model/createTodoStore.ts` and
`apps/todo/src/features/todos/model/todoThunks.ts` for a thunk example.

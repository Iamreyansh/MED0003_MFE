# Contributing to MED0003_MFE

## Sibling layout

Clone Portal and MFE as siblings under the same parent directory:

```text
medmate/
  MED0002_PharmacyPortal/
  MED0003_MFE/          ← this repo
```

Pharmacy Portal depends on shared packages via `file:../MED0003_MFE/packages/...`.

## Quick start

```bash
nvm use                 # Node 20 (.nvmrc)
pnpm install
pnpm dev:todo           # http://localhost:5101
```

Or start Todo and print a Portal `.env` snippet:

```bash
pnpm run dev:with-host
```

## Quality commands

| Command                        | Purpose                                                  |
| ------------------------------ | -------------------------------------------------------- |
| `pnpm test`                    | Unit tests (pre-push)                                    |
| `pnpm test:coverage`           | Unit tests + **100%** coverage (CI)                      |
| `pnpm lint` / `pnpm typecheck` | ESLint / TypeScript                                      |
| `pnpm validate:mfes`           | Catalog uniqueness                                       |
| `pnpm quality`                 | Full gate (format + lint + typecheck + coverage + build) |

Coverage thresholds stay at **100%** — do not lower them.

## Create a remote

```bash
pnpm create:mfe inventory
```

See [docs/development/create-mfe.md](docs/development/create-mfe.md).

## Docs

- [Local development](docs/development/local-development.md)
- [Architecture](docs/architecture/overview.md)
- [Deploy](docs/deploy/deploy.md)

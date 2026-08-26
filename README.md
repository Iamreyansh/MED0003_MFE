# MED0003_MFE — React Micro-Frontend Monorepo

Producer monorepo for NammaMedMate Module Federation remotes.

## Layout

```
apps/<name>/                 # independently deployable remote
packages/
  contracts/                 # shared data envelope
  federation-config/         # singleton maps + remote env helpers
  host-kit/                  # host-facing RemoteLoader (MED0002)
  mfe-kit/                   # remote runtime
  ui/                        # design system
  test-utils/
  tooling/vite-config|vitest-config|playwright-config
config/mfes.json             # catalog (name, domain, port, path)
dist/<name>/                 # remote federation output
tools/create-mfe             # generator
docs/adr                     # architecture decisions
```

## Architecture

- Each MFE lives under `apps/<name>`
- Every exposed root accepts **exactly one prop**: `data`
- Stable public domain per MFE: `https://<name>.mfe.nammamedmate.com` (staging: `https://<name>.staging.mfe.nammamedmate.com`)
- Host (MED0002) loads `https://<name>.mfe.nammamedmate.com/mf-manifest.json`
- Public federation surface is always `./Mfe`
- Domain layout lives inside the remote; global shell stays in MED0002

## Quick start

```bash
pnpm install
pnpm dev:todo
# or: pnpm run dev:with-host  (prints Portal .env snippet)
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for sibling layout with Pharmacy Portal.

## Create a new MFE

```bash
pnpm create:mfe inventory
# then merge to main; staging deploys automatically, production waits on PDT
```

## Quality gates

```bash
pnpm run quality
```

Coverage thresholds are **100%** (kept in CI; pre-push runs `pnpm test`).

## Docs

- [Architecture](docs/architecture/overview.md)
- [ADRs](docs/adr/README.md)
- [Data contract](docs/contracts/data-contract.md)
- [Design system](docs/design-system/README.md)
- [Local development](docs/development/local-development.md)
- [Create MFE](docs/development/create-mfe.md)
- [Host integration](docs/development/host-integration.md)
- [Deploy & rollback](docs/deploy/deploy.md)
- [AWS bootstrap](docs/infra/aws-bootstrap.md)

# MED0003_MFE — React Micro-Frontend Monorepo

Producer monorepo for NammaMedMate Module Federation remotes.

## Layout

```
config/
  vite/mfe.ts            # shared Vite + federation bootstrap
  vitest/base.ts         # shared Vitest + coverage bootstrap
  mfes.json              # reviewed catalog (name, domain, port, package)
packages/
  shared/
    mfe-kit/             # mountStandalone + Redux/thunk store factory
    contracts/ ui/ test-utils/
  components/
    todo/                # reference remote
      bootstrap.tsx      # standalone harness
      index.tsx          # federated ./Mfe
      src/{components,services,utils,store,styles,test}
infra/                   # Terraform: per-MFE sites + turbo cache S3
scripts/                 # deploy, affected, cache, smoke, tf lock backup
tools/create-mfe         # generator for new remotes
docs/                    # topic folders (architecture, contracts, …)
```

## Architecture

- Each MFE lives under `packages/components/<name>`
- Every exposed root accepts **exactly one prop**: `data`
- Stable public domain per MFE: `https://<name>.mfe.nammamedmate.com`
- Host (MED0002) loads `https://<name>.mfe.nammamedmate.com/mf-manifest.json`
- MFEs reuse root configs — no duplicated federation/vitest blocks

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
# then: commit catalog change, terraform apply, implement UI
```

## Quality gates

```bash
pnpm run quality
```

Coverage thresholds are **100%** (kept in CI; pre-push runs `pnpm test`).

## Docs

- [Architecture](docs/architecture/overview.md)
- [Data contract](docs/contracts/data-contract.md)
- [Local development](docs/development/local-development.md)
- [Create MFE](docs/development/create-mfe.md)
- [Deploy & rollback](docs/deploy/deploy.md)
- [AWS bootstrap](docs/infra/aws-bootstrap.md)

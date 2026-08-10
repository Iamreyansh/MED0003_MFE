# MED0003_MFE — React Micro-Frontend Monorepo

Producer monorepo for NammaMedMate Module Federation remotes.

## Layout

```
packages/
  shared/
    contracts/   # data-prop envelope + feature contracts
    ui/          # shared presentational primitives
    test-utils/  # test helpers
  components/
    todo/        # reference remote MFE
config/mfes.json # reviewed catalog (name, domain, port, package)
infra/           # Terraform: per-MFE S3 + CloudFront + Route53 subdomain
tools/create-mfe # generator for new remotes
```

## Architecture

- Each MFE lives under `packages/components/<name>`
- Every exposed root accepts **exactly one prop**: `data`
- Stable public domain per MFE: `https://<name>.mfe.nammamedmate.com`
- Host (MED0002) loads `https://<name>.mfe.nammamedmate.com/mf-manifest.json`

## Quick start

```bash
pnpm install
pnpm --filter @medmate/todo dev
```

## Create a new MFE

```bash
pnpm create:mfe inventory
# then: commit catalog change, terraform apply, implement UI
```

## Quality gates

```bash
pnpm run validate:mfes
pnpm run lint
pnpm run typecheck
pnpm run test:coverage
pnpm run build
```

## Docs

- [Architecture](docs/architecture.md)
- [Data contract](docs/data-contract.md)
- [Local development](docs/local-development.md)
- [Create MFE](docs/create-mfe.md)
- [Deploy & rollback](docs/deploy.md)
- [AWS bootstrap](docs/aws-bootstrap.md)

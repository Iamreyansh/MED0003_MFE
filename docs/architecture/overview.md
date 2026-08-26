# Architecture

```
PharmacyPortal (MED0002)
  └─ RemoteLoader(remote=todo, module=./Mfe, componentProps={ data })
       └─ https://todo.mfe.nammamedmate.com/mf-manifest.json
            └─ Todo MFE (MED0003 apps/todo)
```

## Principles

1. **One app = one independently deployable remote**
2. **Permanent subdomain per remote** (not per release)
3. **Immutable release objects** under `/releases/<git-sha>/`
4. **Atomic promotion** of root `mf-manifest.json`
5. **Shared React singleton** (`18.3.1`) across host and remotes
6. **Contracts package** owns the `data` envelope; remotes never read host globals
7. **Shared bootstrap** via `@medmate/mfe-kit` + `@medmate/vite-config` / `@medmate/vitest-config` / `@medmate/playwright-config`
8. **Optional Redux** via `createMfeStore` + thunks when an MFE needs local state
9. **Host owns global shell**; remotes own domain layout only
10. **Single public expose**: `./Mfe`
11. **Shared install and dist**: hoisted `node_modules`, remote output at `dist/<name>/`
12. **Third-party deps live at the repo root**; app `package.json` files are `workspace:*` only

## Layout

```
apps/<mfe>/
  src/entrypoints/remote.tsx      # federated ./Mfe + shared UI styles
  src/entrypoints/standalone.tsx  # local harness
  src/app/                        # envelope + providers
  src/layouts/                    # domain layout
  src/features/<slice>/           # api, model, lib
  src/ui/                         # presentational components
  e2e/                            # Playwright config, specs, mocks
  src/contract.ts
packages/{contracts,ui,mfe-kit,host-kit,federation-config,test-utils,tooling}
config/mfes.json
dist/<mfe>/                       # Vite + federation output
```

See [ADRs](../adr/README.md) for the decisions behind these boundaries.

## Scaling to many MFEs

1. `pnpm create:mfe <name>` updates `config/mfes.json`
2. Terraform `for_each` provisions bucket + CloudFront + DNS
3. Deploy workflow matrix ships only affected packages
4. Host adds `VITE_REMOTE_<NAME>_URL` and a route mount

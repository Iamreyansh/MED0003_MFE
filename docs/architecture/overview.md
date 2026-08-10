# Architecture

```
PharmacyPortal (MED0002)
  └─ RemoteLoader(remote=todo, module=./Mfe, componentProps={ data })
       └─ https://todo.mfe.nammamedmate.com/mf-manifest.json
            └─ Todo MFE (MED0003 packages/components/todo)
```

## Principles

1. **One package = one independently deployable remote**
2. **Permanent subdomain per remote** (not per release)
3. **Immutable release objects** under `/releases/<git-sha>/`
4. **Atomic promotion** of root `mf-manifest.json`
5. **Shared React singleton** (`18.3.1`) across host and remotes
6. **Contracts package** owns the `data` envelope; remotes never read host globals
7. **Shared bootstrap** via `@medmate/mfe-kit` + root `config/vite` / `config/vitest`
8. **Optional Redux** via `createMfeStore` + thunks when an MFE needs local state

## Low-redundancy layout

```
config/
  vite/mfe.ts          # createMfeViteConfig — federation + React shared
  vitest/base.ts       # createVitestConfig — 100% coverage defaults
packages/shared/
  mfe-kit/             # mountStandalone, Redux factory, typed hooks
  contracts/ ui/ test-utils/
packages/components/<mfe>/
  bootstrap.tsx        # standalone harness (imports mfe-kit)
  index.tsx            # federated ./Mfe entry
  vite.config.ts       # thin: createMfeViteConfig({ name, port })
  vitest.config.ts     # thin: createVitestConfig(...)
  src/{components,services,utils,store,styles,test}
```

## Scaling to many MFEs

1. `pnpm create:mfe <name>` updates `config/mfes.json`
2. Terraform `for_each` provisions bucket + CloudFront + DNS
3. Deploy workflow matrix ships only affected packages
4. Host adds `VITE_REMOTE_<NAME>_URL` and a route mount

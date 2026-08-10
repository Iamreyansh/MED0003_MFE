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

## Scaling to many MFEs

1. `pnpm create:mfe <name>` updates `config/mfes.json`
2. Terraform `for_each` provisions bucket + CloudFront + DNS
3. Deploy workflow matrix ships only affected packages
4. Host adds `VITE_REMOTE_<NAME>_URL` and a route mount

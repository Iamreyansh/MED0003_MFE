# MED0002 host integration

MED0003 does not edit the Pharmacy Portal repository. After this layout
migration, update MED0002 `file:` dependencies if they still point at
`packages/shared/*`.

Package names are unchanged:

| Package                      | New path                       | Consumer          |
| ---------------------------- | ------------------------------ | ----------------- |
| `@medmate/contracts`         | `packages/contracts`           | Host + remotes    |
| `@medmate/federation-config` | `packages/federation-config`   | Host Vite config  |
| `@medmate/host-kit`          | `packages/host-kit`            | Host only         |
| `@medmate/vite-config`       | `packages/tooling/vite-config` | Host Vite factory |
| `@medmate/ui`                | `packages/ui`                  | Optional in host  |

The Todo remote still exposes `./Mfe`. Local host env stays optional:

```
VITE_REMOTE_TODO_URL=http://localhost:5101/mf-manifest.json
```

Deployed hosts set one suffix for every remote (`getRemoteUrl` builds `https://<name>.<suffix>/mf-manifest.json`):

```
VITE_MFE_DOMAIN_SUFFIX=mfe.nammamedmate.com
```

Staging uses `VITE_MFE_DOMAIN_SUFFIX=staging.mfe.nammamedmate.com`. Explicit `VITE_REMOTE_<NAME>_URL` still overrides a single remote.

Do **not** load a federated layout/shell from remotes. Compose domain UI inside
host `<main>` via `RemoteLoader` / `MfeOutlet`.

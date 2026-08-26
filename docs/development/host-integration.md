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

The Todo remote still exposes `./Mfe`. Host env stays:

```
VITE_REMOTE_TODO_URL=http://localhost:5101/mf-manifest.json
```

Production:

```
VITE_REMOTE_TODO_URL=https://todo.mfe.nammamedmate.com/mf-manifest.json
```

Do **not** load a federated layout/shell from remotes. Compose domain UI inside
host `<main>` via `RemoteLoader` / `MfeOutlet`.

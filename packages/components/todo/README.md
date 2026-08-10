# Todo MFE (reference remote)

This package is the canonical Module Federation remote for NammaMedMate.

## Contract

The exposed module `./Mfe` accepts **exactly one prop**:

```tsx
<TodoMfe data={envelope} />
```

`data` is an `MfeDataEnvelope<TodoFeatureData>` from `@medmate/contracts`.

## Local development

```bash
pnpm --filter @medmate/todo dev
```

Open http://localhost:5101 for the standalone harness.

## Production URL

Stable domain: `https://todo.mfe.nammamedmate.com/mf-manifest.json`

Hosts (e.g. MED0002) should point `VITE_REMOTE_TODO_URL` at that manifest.

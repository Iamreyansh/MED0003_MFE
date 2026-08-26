# ADR 0003 — Single `./Mfe` federation surface

## Status

Accepted

## Context

Hosts load remotes through a stable Module Federation expose. Extra exposes (layout, routes, widgets) increase CSS/asset complexity and couple host routing to remote internals.

## Decision

- Every remote exposes exactly one public module: `./Mfe`.
- The federated entry lives at `src/entrypoints/remote.tsx` and is the only CSS side-effect path for production hosts.
- Standalone development uses `src/entrypoints/standalone.tsx` and is never federated.
- The Vite factory default expose is `{ './Mfe': './src/entrypoints/remote.tsx' }`.

## Consequences

- Host integration stays one env URL + one module id (`<name>/Mfe`).
- CSS must be imported on the federated entry so `mf-manifest.json` includes styles.
- Internal folders (`app`, `layouts`, `features`) can change without a host contract bump.

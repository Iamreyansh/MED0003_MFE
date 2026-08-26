# ADR 0004 — Contract evolution

## Status

Accepted

## Context

Hosts and remotes share a versioned `MfeDataEnvelope`. Feature-specific payloads belong to each remote. Breaking envelope changes must not silently ship.

## Decision

- Shared envelope types live in `@medmate/contracts`. Feature types live in each remote's `src/contract.ts`.
- Every remote root accepts exactly one prop: `{ data }`.
- Remotes never import `@medmate/host-kit`. Shared packages never import a remote.
- `contractVersion` is a compatibility gate. Breaking envelope changes require a new version and coordinated host/remote rollout.
- Shared packages export TypeScript source in the workspace (`exports` point at `src`) so sibling `file:` consumption stays simple. Dist builds remain available for packages that already emit them.

## Consequences

- Host capabilities (`navigate`, `api`, `events`, `telemetry`) stay optional and host-owned.
- Secrets, tokens, cookies, and API bases stay in the host.
- Catalog validation and ESLint enforce the dependency direction.

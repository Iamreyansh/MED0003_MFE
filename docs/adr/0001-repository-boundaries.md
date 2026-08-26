# ADR 0001 — Repository boundaries

## Status

Accepted

## Context

MED0003 produces independently deployable Module Federation remotes. Deployable Vite apps lived under `packages/components/` while libraries lived under `packages/shared/`, which hid the deployment boundary.

## Decision

- Deployable remotes live under `apps/<name>` and remain independently deployable packages (`@medmate/<name>`).
- Reusable libraries live under a flat `packages/` tree (`contracts`, `federation-config`, `host-kit`, `mfe-kit`, `ui`, `test-utils`, `tooling/*`).
- Package names (`@medmate/*`) stay stable so MED0002 `file:` dependencies keep working after path updates.
- `config/mfes.json` remains the operational catalog. `tools/create-mfe` remains the generator.

## Consequences

- Folder names match deploy vs library ownership.
- Catalog, CI, Terraform, and the generator must read `path` from the catalog rather than assuming `packages/components`.

---
name: medmate-react-patterns
description: Applies React composition, state ownership, rendering, and performance patterns for MedMate remotes and shared UI. Use when reviewing components, hooks, effects, loading/error states, or bundle impact.
---

# MedMate React patterns

## Composition

- Keep remote roots thin: validate `data`, provide store, render domain layout.
- Feature slices own `api`, `model`, and `lib` only. Presentational UI lives in `src/ui`.
- Derive view models in hooks. Do not store mirrored derived state.

## State

- Host session and navigation stay in MED0002 (`data.context` / capabilities).
- Feature state is local (Redux via `mfe-kit` or React state).
- Effects are for synchronization and host callbacks, not for computing lists.

## Performance

- Avoid passing new object identity from the host envelope into deep children when it is unused.
- Memoize only measured hot paths.
- Do not fetch from remotes; use `data.capabilities.api` when the host provides it.

## Loading and errors

- Empty/loading/error are first-class UI using `StatusMessage`.
- Remote failures must not throw past the host error boundary except for contract violations.

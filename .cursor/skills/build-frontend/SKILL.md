---
name: build-frontend
description: Derive a design contract first, then implement an accessible responsive interface with MedMate tokens and primitives.
disable-model-invocation: true
---

# /build-frontend

1. Derive the design contract: purpose, users, states, breakpoints.
2. Map UI to `@medmate/ui` primitives/layout/feedback before writing CSS.
3. Implement in the remote vertical slice (`features/`, `layouts/`).
4. Import CSS only from entrypoints. Pass data through `{ data }`.
5. Add tests for interaction and empty/error states.

Read `medmate-frontend-design`, `medmate-mfe-architecture`, and `medmate-react-patterns`.

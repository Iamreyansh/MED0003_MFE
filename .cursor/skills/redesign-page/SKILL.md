---
name: redesign-page
description: Preserve behavior and contracts while systematically redesigning an existing MedMate page or remote view.
disable-model-invocation: true
---

# /redesign-page

1. Capture current behavior, contract props, and tests.
2. Redesign visual structure without changing `data` shape or expose `./Mfe`.
3. Replace inline styles and raw colors with tokens/primitives.
4. Keep domain layout inside the remote; do not invent host chrome.
5. Update tests so coverage stays at 100%.

Read `medmate-frontend-design` and `medmate-mfe-architecture`.

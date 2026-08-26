---
name: design-audit
description: Assess hierarchy, typography, spacing, color, responsiveness, states, accessibility, and design-system drift before proposing UI changes.
disable-model-invocation: true
---

# /design-audit

Audit first. Do not implement until the report is written.

1. Identify the surface and whether it is host chrome or remote domain UI.
2. Score hierarchy, type, spacing, color, states, responsive, a11y, token drift.
3. Cite concrete files. Prefer `@medmate/ui` and `--mm-*` tokens as the fix.
4. List only high-impact changes. Preserve MFE contracts and behavior.

Read `medmate-frontend-design` and `docs/design-system/README.md`.

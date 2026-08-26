---
name: medmate-frontend-design
description: Applies high-end, minimal, modern frontend design for MedMate remotes. Use when designing, building, redesigning, reviewing UI, choosing typography/color/spacing, composing shadcn-like primitives, or checking visual quality and accessibility.
---

# MedMate frontend design

## Precedence

MFE contracts, accessibility, and performance override visual taste.

## Taste

- Healthcare SaaS: calm, high contrast, restrained motion, dense but breathable.
- One strong accent (`bg-mm-primary` / `--color-mm-primary`). No decorative gradients or emoji icons.
- Typography hierarchy: one title size, one body size, muted secondary text.
- Spacing from Tailwind scale (`gap-2`, `p-4`) aligned to an 8px-ish rhythm.
- Prefer composition of `@medmate/ui` over new markup. Style with Tailwind utilities.

## Workflow

1. Identify product surface, states (empty/loading/error/success), and breakpoints (375/768/1024).
2. Reuse tokens and primitives from `docs/design-system/README.md`.
3. If a primitive is missing, add it to `@medmate/ui` instead of one-off markup.
4. Check contrast, focus rings, associated labels, and reduced motion.

## Anti-patterns

- New `.css` files in remotes
- Inline `style` for color/spacing
- Mixing container widths
- Scale transforms that shift layout
- Unlabeled inputs or icon-only buttons without accessible names
- UI folders under `src/features`

## References

- [docs/design-system/README.md](docs/design-system/README.md)
- [reference.md](reference.md)

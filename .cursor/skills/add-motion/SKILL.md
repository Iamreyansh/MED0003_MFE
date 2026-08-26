---
name: add-motion
description: Choose CSS, View Transitions, or GSAP based on need; implement scoped cleanup and reduced-motion behavior.
disable-model-invocation: true
---

# /add-motion

1. Default to CSS. Use View Transitions for page swaps. Use GSAP only for sequences.
2. Implement in `useLayoutEffect` with `gsap.context` cleanup when GSAP is required.
3. Animate transform/opacity only. Honor `prefers-reduced-motion`.
4. Do not animate host chrome from a remote.

Read `medmate-motion-engineering`.

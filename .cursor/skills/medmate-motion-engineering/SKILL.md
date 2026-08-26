---
name: medmate-motion-engineering
description: Guides CSS, View Transitions, and GSAP motion for MedMate remotes. Use when adding animation, timelines, ScrollTrigger, plugins, React GSAP integration, motion performance, cleanup, or reduced-motion support.
---

# MedMate motion engineering

Activate only when motion is requested or materially improves orientation.

## Choose the simplest tool

1. CSS transitions/transforms for hover, color, opacity, small movement.
2. Native View Transitions for page/section swaps when the host supports them.
3. GSAP for sequenced timelines, complex orchestration, or scroll-linked scenes.

## GSAP in React

- Create tweens/timelines in `useLayoutEffect`.
- Scope selectors with `gsap.context` and revert on unmount.
- Kill ScrollTrigger instances in the same cleanup.
- Animate `transform` and `opacity` only. Avoid layout properties.
- Honor `prefers-reduced-motion`: skip or replace with an instant state.

## Performance

- Batch reads/writes. Do not animate large DOM lists item-by-item.
- Prefer one timeline over many overlapping tweens.
- Do not ship GSAP plugins unless the scene needs them.

## References

- [reference.md](reference.md)

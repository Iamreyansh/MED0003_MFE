# Motion checklist

- Cleanup: `ctx.revert()` and `ScrollTrigger.getAll()` killed on unmount.
- No animation of `top/left/width/height` unless essential.
- GPU-friendly properties only (`transform`, `opacity`).
- Reduced motion: CSS `@media (prefers-reduced-motion: reduce)` and GSAP skip.
- ScrollTrigger: `invalidateOnRefresh`, avoid nested scroll containers.
- View Transitions: wrap updates in `document.startViewTransition` when available.

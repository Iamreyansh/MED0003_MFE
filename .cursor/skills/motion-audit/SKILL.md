---
name: motion-audit
description: Inspect animation correctness, layout thrashing, ScrollTrigger lifecycle, GPU cost, and runtime cleanup.
disable-model-invocation: true
---

# /motion-audit

1. List every animation and its trigger.
2. Flag layout-property tweens, missing cleanup, and skipped reduced-motion.
3. Check ScrollTrigger create/kill pairing and refresh behavior.
4. Recommend CSS replacements where GSAP is unnecessary.

Read `medmate-motion-engineering`.

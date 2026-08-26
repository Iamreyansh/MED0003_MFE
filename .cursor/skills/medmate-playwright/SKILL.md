---
name: medmate-playwright
description: Playwright locator, fixture, isolation, CLI, accessibility, responsive, and deterministic testing practices for MedMate hosts and remotes. Use when writing or running browser tests, smoke checks, or keyboard/responsive coverage.
---

# MedMate Playwright

Every remote owns its browser suite under `apps/<mfe>/e2e/`:

```
e2e/playwright.config.ts   # createMfePlaywrightConfig
e2e/specs/*.spec.ts
e2e/mocks/
```

Cover the standalone harness end to end (happy path, empty, error, keyboard, 375px). Host composition coverage stays in MED0002.

## Practices

- Prefer role/label locators over test ids unless the role is insufficient.
- Isolate tests: unique pharmacy/user fixtures, no shared mutable storage.
- Wait for role/text, not arbitrary timeouts.
- CLI: `pnpm test:e2e`, `--ui` for debug, `--trace on` for flakes.

## Remote-specific

- `webServer` starts the remote via `createMfePlaywrightConfig`.
- Smoke `mf-manifest.json` and `remoteEntry.js` via `pnpm smoke:mfe` after deploy.

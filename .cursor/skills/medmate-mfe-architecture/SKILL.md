---
name: medmate-mfe-architecture
description: Enforces NammaMedMate micro-frontend boundaries, data contracts, federation surface, domain layout ownership, generator conventions, and MFE test structure. Use when creating remotes, changing apps/, packages/, catalog, Vite federation, or host integration.
---

# MedMate MFE architecture

## Rules

1. Deploy remotes under `apps/<name>`. Libraries stay in `packages/`.
2. Public expose is always `./Mfe` from `src/entrypoints/remote.tsx`.
3. Root component accepts `{ data }` and calls `assertMfeDataEnvelope`.
4. Feature types live in `src/contract.ts`, not `@medmate/contracts`.
5. Import `@medmate/ui/styles.css` only on federated and standalone entrypoints. No other CSS files.
6. Remotes never import `@medmate/host-kit`. Shared packages never import remotes.
7. MED0002 owns global shell, router, auth, nav, and secrets.
8. Remotes may own domain layout (`src/layouts`) composed inside `./Mfe`.
9. Use `createMfeViteConfig`, `createVitestConfig`, and `createMfePlaywrightConfig`.
10. API access goes through `data.capabilities.api.request`.
11. App `package.json` files declare only `workspace:*` deps (React/Vite/Playwright live at the repo root).
12. Builds emit to repo-root `dist/<name>/`.
13. UI components live in `src/ui`, never `src/features/**/ui`.
14. Unit tests live in `__tests__/`. Playwright config, specs, and mocks live in `apps/<mfe>/e2e/`.

## Layout

```
src/entrypoints/{remote,standalone}.tsx
src/app/            # providers + contract gate
src/layouts/        # domain layout
src/features/<slice>/{api,model,lib}
src/ui/             # presentational components
src/contract.ts
e2e/{playwright.config.ts,specs,mocks}
```

## References

- [docs/adr](docs/adr/README.md)
- [docs/architecture/overview.md](docs/architecture/overview.md)
- [docs/contracts/data-contract.md](docs/contracts/data-contract.md)
- [docs/development/create-mfe.md](docs/development/create-mfe.md)

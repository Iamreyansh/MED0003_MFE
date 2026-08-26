# Agent guide — MED0003_MFE

Producer monorepo for NammaMedMate Module Federation remotes. The Pharmacy
Portal host lives in sibling repo MED0002.

## Map

- Deployable remotes: `apps/<name>`
- Libraries: `packages/{contracts,ui,mfe-kit,host-kit,federation-config,test-utils,tooling}`
- Catalog: `config/mfes.json`
- Generator: `pnpm create:mfe <name>`
- Decisions: `docs/adr/`
- Design: `docs/design-system/README.md`
- Remote builds: `dist/<name>/`

## Hard rules

- One public expose per remote: `./Mfe`
- Root component accepts `{ data }` only
- Import `@medmate/ui/styles.css` only in `src/entrypoints/remote.tsx` and `standalone.tsx`
- No per-remote `.css` or `index.html`; Tailwind + shared Vite HTML plugin
- Remotes must not import `@medmate/host-kit`
- Shared packages must not import remotes
- Global shell stays in MED0002; remotes own domain layout only
- App `package.json` files list only `workspace:*` dependencies
- UI lives in `src/ui` or `@medmate/ui`, never `src/features/**/ui`
- Unit tests in `__tests__/`; Playwright in `apps/<mfe>/e2e/`

## Commands

```bash
pnpm validate:mfes
pnpm quality
pnpm create:mfe <name>
```

## Skills

Auto-apply: `medmate-mfe-architecture`, `medmate-frontend-design`,
`medmate-react-patterns`, `medmate-playwright`.
Motion: `medmate-motion-engineering` when animation is requested.
Explicit workflows: `/design-audit`, `/build-frontend`, `/redesign-page`,
`/add-motion`, `/motion-audit`, `/react-review`, `/playwright-check`.

# Create an MFE

```bash
pnpm create:mfe inventory
```

This will:

1. Scaffold `apps/inventory` with the standard layout
2. Append an entry to `config/mfes.json` with domain `inventory.mfe.nammamedmate.com`
3. Allocate the next free port in `5100-5999`

## Generated layout

```
src/
  entrypoints/remote.tsx       # federated expose ./Mfe (import @medmate/ui/styles.css here)
  entrypoints/standalone.tsx   # StandaloneShell + mountStandalone from @medmate/mfe-kit
  app/                         # contract validation + providers
  layouts/                     # domain layout only
  features/<name>/             # api, model, lib (no UI)
  ui/                          # presentational components
  contract.ts
e2e/                           # Playwright config, specs, mocks
vite.config.ts                 # createMfeViteConfig from @medmate/vite-config
vitest.config.ts               # createVitestConfig from @medmate/vitest-config
```

Do **not** add `index.html`, `src/styles`, or any `.css` file. The Vite factory
serves a shared HTML shell and Tailwind via `@medmate/ui/styles.css`. Import
that stylesheet on the **federated** path (`src/entrypoints/remote.tsx`) so the
MF manifest includes CSS. Do **not** import CSS inside the root `*Mfe` component.

App `package.json` files may only list `workspace:*` dependencies.

Then:

1. Implement `src/app/<Name>Mfe.tsx` using `{ data }` only
2. Add unit tests in `__tests__` folders at 100% coverage
3. Add Playwright coverage in `e2e/specs`
4. Wire the host (MED0002): remotes registry + route — see the generator checklist
5. Open a PR (CI validates uniqueness + quality)
6. Apply Terraform so DNS/CDN exist
7. Merge to `main` to deploy

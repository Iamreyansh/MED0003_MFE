# Create an MFE

```bash
pnpm create:mfe inventory
```

This will:

1. Scaffold `packages/components/inventory` with the standard layout
2. Append an entry to `config/mfes.json` with domain `inventory.mfe.nammamedmate.com`
3. Allocate the next free port in `5100-5999`

## Generated layout

```
bootstrap.tsx          # standalone — mountStandalone from @medmate/mfe-kit
index.tsx              # federated expose ./Mfe (must import CSS here)
vite.config.ts         # createMfeViteConfig (@medmate/vite-config / config/vite/mfe.ts)
vitest.config.ts       # createVitestConfig (@medmate/vitest-config / config/vitest/base.ts)
src/
  components/ + __tests__/
  hooks/
  constants/ + __tests__/
  services/ + __tests__/
  store/
  utils/ + __tests__/
  types/
  styles/              # imported from index.tsx + bootstrap.tsx (not the Mfe component)
```

Import `@medmate/ui/styles.css` and the MFE stylesheet on the **federated** path
(`index.tsx`). Styles imported only in `bootstrap.tsx` never reach the host — the
MF manifest `exposes[].assets.css` stays empty. Do **not** import CSS inside the
root `*Mfe` component (keeps federation CSS ownership clear).

Then:

1. Implement `src/components/<Name>Mfe.tsx` using `{ data }` only
2. Add tests with 100% coverage
3. Wire the host (MED0002): remotes registry + route — see the generator checklist
4. Open a PR (CI validates uniqueness + quality)
5. Apply Terraform so DNS/CDN exist
6. Merge to `main` to deploy

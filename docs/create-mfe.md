# Create an MFE

```bash
pnpm create:mfe inventory
```

This will:

1. Scaffold `packages/components/inventory`
2. Append an entry to `config/mfes.json` with domain `inventory.mfe.nammamedmate.com`
3. Allocate the next free port in `5100-5999`

Then:

1. Implement `src/mfe/Mfe.tsx` using `{ data }` only
2. Add tests with 100% coverage
3. Open a PR (CI validates uniqueness + quality)
4. Apply Terraform so DNS/CDN exist
5. Merge to `main` to deploy

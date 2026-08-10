# Todo MFE

- Domain: `https://todo.mfe.nammamedmate.com`
- Standalone: `pnpm --filter @medmate/todo dev`
- Federated expose: `./Mfe` via package-root `index.tsx`

## Layout

```
bootstrap.tsx
index.tsx
src/
  components/     # UI pieces + __tests__
  hooks/          # view-model / action hooks + __tests__
  constants/      # copy, filters, store names + __tests__
  services/       # domain adapters + __tests__
  store/          # redux slice / thunks / selectors + __tests__
  utils/          # pure helpers + __tests__
  types/
  styles/
  test/
```

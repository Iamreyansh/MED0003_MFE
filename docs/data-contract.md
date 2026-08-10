# Data contract

Every remote root component signature:

```ts
type MfeProps<T> = { data: Readonly<MfeDataEnvelope<T>> };
```

Envelope fields:

| Field             | Purpose                                           |
| ----------------- | ------------------------------------------------- |
| `contractVersion` | Semver gate (`1.0.0`)                             |
| `context`         | hostId, locale, pharmacyId, userId, permissions   |
| `feature`         | MFE-specific payload (initial state, callbacks)   |
| `capabilities`    | optional host-owned navigate/api/events/telemetry |

## Rules

- Remotes must not read `localStorage`, cookies, or hardcode API bases
- Secrets stay in the host; remotes call `data.capabilities.api.request`
- Callbacks (e.g. `feature.onChange`) are part of `data`, not sibling props
- Breaking envelope changes require a new `contractVersion`

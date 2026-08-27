# Design system

Canonical visual rules for NammaMedMate remotes. Host chrome stays in MED0002;
remotes consume `@medmate/ui` for feature UI and Tailwind utilities.

## Tokens

Tokens live in `@medmate/ui/styles.css` as Tailwind v4 `@theme` values. Use
utilities such as `bg-mm-primary` and `text-mm-muted`. Do not add remote `.css`
files, raw hex, or inline `style`.

| Token / utility      | Use                       |
| -------------------- | ------------------------- |
| `text-mm-text`       | Body text                 |
| `text-mm-muted`      | Secondary text            |
| `text-mm-display`    | Page titles               |
| `bg-mm-primary`      | Primary actions           |
| `bg-mm-primary-soft` | Brand / wash surfaces     |
| `bg-mm-danger`       | Destructive actions       |
| `font-mm`            | Body type                 |
| `font-mm-heading`    | Headings                  |
| `outline-mm-focus`   | `:focus-visible` ring     |
| `gap-*` / `p-*`      | Spacing scale             |
| `duration-mm`        | Color/opacity transitions |

The host may override tokens on `:root` or `[data-theme]`. Remotes must not
force a theme.

## Primitives

Prefer `@medmate/ui` before custom markup. Style with Tailwind utilities and
`cn()`. Use `as` / `asChild` instead of raw tags.

- Elements: `Box`, `Flex`, `Grid`, `Text`, `Heading`, `Container`, `Separator`,
  `Form`, `Fieldset`, `VisuallyHidden`
- Layout: `Stack`, `Inline`, `PageSection`
- Primitives: `Button`, `Input`, `Label`, `TextField`, `Card` (compound),
  `Dialog`, `Alert`, `Table`, `InputOTP`, `Badge`
- Feedback: `StatusMessage`, `Spinner`
- Utility: `cn`

Place remote-specific UI in `src/ui/<screen>/`, never under `src/features`.

## Contribution

1. Add tokens to `packages/ui/src/styles.css` `@theme` first.
2. Add the component under `elements/`, `primitives/`, `layout/`, or `feedback/`.
3. Export from `packages/ui/src/index.ts`.
4. Cover 100% tests including keyboard/label associations.
5. Document the API here.

## Accessibility

- Visible `:focus-visible` on interactive controls
- Associated labels on every input
- `role="status"` for empty/loading/error copy
- Honor `prefers-reduced-motion` via `--duration-mm`

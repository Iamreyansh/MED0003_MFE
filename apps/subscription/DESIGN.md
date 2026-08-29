# Subscription Formulary Comparison

Visual contract for the subscription remote. The page is a vertical stack of
sections. Plans compare **side by side** inside one Catalogue section.

## Decorative vocabulary

- Double hairline rule under the kicker, with a small teal square tick
- Lucide icon tile on each plan column
- Current plan stamped: teal top rail, primary-soft wash, inverted header
- Vertical module list with tick icons; plan CTA sits under that list
- Token-only color (`mm-primary`, `mm-border`, `mm-surface`). No gradients.

## Plans — desktop

```text
  ── PLAN INDEX ──■──                                    [ Trial ]
  Subscription
  See seats, invoice caps, and modules from your current plan.

┌──────────────────────────────────────────────────────────────────────┐
│  ◆  NOW ON  Starter          3 seats · pos, khata     Auto-renew ☑  │
└──────────────────────────────────────────────────────────────────────┘

CATALOGUE                                              compare side by side
┌────────────┬────────────┬════════════════╤────────────┬────────────┐
│            │  ○         │  ■             │  ▤         │  ▣         │
│            │  Free      │  Starter       │  Growth    │  Enterprise│
│            │            │  [Current]     │            │            │
├────────────┼────────────┼────────────────┼────────────┼────────────┤
│  Monthly   │  ₹0        │  ₹499          │  ₹1,499    │  Custom    │
│  Annual    │  —         │  ₹4,990        │  —         │  Contact   │
│  Seats     │  ▮□□□  1   │  ▮▮▮□  3      │  —         │  —         │
│  Modules   │  ✓ pos     │  ✓ pos         │  ✓ analytics│  —        │
│            │            │  ✓ khata       │             │            │
│            │            │                │ [Upgrade]   │ [Upgrade]  │
└────────────┴────────────┴════════════════╧────────────┴────────────┘
  sticky spec labels ←──────── plan columns compare left-to-right ──────→

                                              [ Cancel subscription ]
```

The Starter column is the stamped current plan (teal top rail + soft wash).

## Plans — 375px

Horizontal comparison must not wrap into a card grid. The matrix scrolls
sideways with a sticky spec-label column.

```text
PLAN INDEX
Subscription

┌ NOW ON Starter · Auto-renew ☑ ┐

CATALOGUE  → swipe to compare
┌────────┬────────┬════════╤────────┐
│        │ Free   │ ★      │ …     │  →
│ Monthly│ ₹0     │ ₹499   │        │
│ Seats  │ 1      │ 3      │        │
└────────┴────────┴════════╧────────┘
```

## Billing — statement ledger

```text
  ── STATEMENT ──■──
  SaaS billing
  Pay pharmacy ERP invoices. Status comes from Core, not this page.

┌─ ◆ INV-UNPAID ──────────────────────────────────────────────────┐
│  Open                                          ₹499             │
│  Status: unpaid                                [ Pay ]          │
└─────────────────────────────────────────────────────────────────┘
┌─ INV-PAID ──────────────────────────────────────────────────────┐
│  Settled                                       ₹1,499           │
│  Status: paid                                                   │
└─────────────────────────────────────────────────────────────────┘
```

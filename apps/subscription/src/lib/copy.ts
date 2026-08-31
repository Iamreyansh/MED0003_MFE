import type { SubscriptionScreen } from '@medmate/subscription-contract';

export const SCREEN_COPY: Record<
  SubscriptionScreen,
  { title: string; helper: string; kicker: string }
> = {
  plans: {
    title: 'Subscription',
    helper: 'See seats, invoice caps, and modules from your current plan.',
    kicker: 'Plan index',
  },
  billing: {
    title: 'SaaS billing',
    helper: 'Pay pharmacy ERP invoices. Status comes from Core, not this page.',
    kicker: 'Statement',
  },
};

export function rootTestId(screen: SubscriptionScreen): string {
  return `subscription-${screen}-page`;
}

export const PLANS_COPY = {
  current: 'Current plan',
  trial: 'Trial',
  pastDue: 'Payment is past due. Pay the open invoice to keep this plan.',
  payCta: 'Go to billing',
  staffHelper: 'Staff can see the current plan. Only the owner can change it.',
  forbidden: 'Plan catalogue is owner-only.',
  empty: 'No plans were returned.',
  seats: 'Seats',
  modules: 'Included modules',
  monthly: 'Monthly',
  annual: 'Annual',
  subscribe: 'Subscribe',
  upgrade: 'Upgrade',
  downgrade: 'Downgrade',
  cancel: 'Cancel subscription',
  autoRenew: 'Auto-renew',
  autoRenewOn: 'Renews at the next cycle',
  autoRenewOff: 'Ends after this cycle',
  confirmSubscribe: 'Subscribe to this plan?',
  confirmUpgrade: 'Upgrade to this plan?',
  confirmDowngrade: 'Downgrade at the next renewal?',
  confirmCancel: 'Cancel this subscription?',
  close: 'Keep plan',
  catalogue: 'Catalogue',
  compareHint: 'Compare side by side',
  nowOn: 'Now on',
} as const;

export const BILLING_COPY = {
  empty: 'No SaaS invoices yet.',
  pay: 'Pay',
  paymentsDisabled: 'Card payments are not enabled in this environment.',
  processing: 'Payment is processing. This invoice is not marked paid yet.',
  forbidden: 'SaaS invoices are owner-only.',
  tableLabel: 'SaaS invoices',
  sessionOnly: 'Checkout session is ready. Open the payment link from Core.',
  open: 'Open',
  settled: 'Settled',
} as const;

import type { OrdersScreen, PageMeta } from '@medmate/orders-contract';

export const SCREEN_COPY: Record<
  OrdersScreen,
  { title: string; helper: string; kicker: string }
> = {
  'rx-quotes': {
    title: 'Rx quotes',
    helper: 'Bid on uploaded prescriptions or decline a slot.',
    kicker: 'Fulfilment',
  },
  'orders-home': {
    title: 'Orders',
    helper: 'Inbound marketplace orders for this pharmacy.',
    kicker: 'Fulfilment',
  },
  'order-actions': {
    title: 'Order actions',
    helper: 'Accept, reject, advance packing, or assign a rider for this id.',
    kicker: 'Fulfilment',
  },
};

export function rootTestId(screen: OrdersScreen): string {
  return `orders-${screen}-page`;
}

export function errorText(
  result: { formError?: string; code?: string },
  fallback = 'Unable to continue.',
): string {
  return result.formError ?? result.code ?? fallback;
}

export function dash(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  return String(value);
}

export function listOf<T>(value: T[] | null | undefined): T[] {
  return value ?? [];
}

export function pageMeta(value: PageMeta | undefined): PageMeta {
  return value ?? {};
}

export function formatIstDate(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) {
    return '—';
  }
  const iso = value.includes('T') ? value : `${value}T00:00:00+05:30`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export const QUOTES_COPY = {
  tableLabel: 'Rx quote queue',
  empty: 'No quote slots in this filter.',
  status: 'Status',
  allStatuses: 'All statuses',
  retry: 'Retry',
  previous: 'Previous page',
  next: 'Next page',
  page: 'Page',
  quote: 'Quote',
  decline: 'Decline',
  quoteTitle: 'Send a quote',
  quoteHelp: 'Price must stay at or below MRP.',
  price: 'Quoted price',
  notes: 'Notes',
  quoteConfirm: 'Send quote',
  declineTitle: 'Decline this quote?',
  declineHelp: 'Add a reason if Core requires one.',
  declineReason: 'Decline reason',
  declineConfirm: 'Confirm decline',
  cancel: 'Cancel',
} as const;

export const HOME_COPY = {
  empty: 'No inbound orders in this filter.',
  tableLabel: 'Inbound orders',
  retry: 'Retry',
  open: 'Open',
  status: 'Status',
  allStatuses: 'All statuses',
  previous: 'Previous page',
  next: 'Next page',
  page: 'Page',
} as const;

export const ACTIONS_COPY = {
  invalidId: 'This order id is not a valid UUID.',
  accept: 'Accept',
  reject: 'Reject',
  rejectTitle: 'Reject this order?',
  rejectHelp: 'A refund is eventual. Confirm before Core rejects the order.',
  rejectReason: 'Rejection reason',
  rejectConfirm: 'Confirm reject',
  cancel: 'Cancel',
  status: 'Advance packing status',
  statusHint: 'Choices are explicit. An illegal transition returns a 409.',
  cachedStatus: 'Local cache — not live. Refresh is not available without GET.',
  rider: 'Assign rider',
  riderHint: 'Pick an active rider, or paste a UUID if the directory is empty.',
  riderId: 'Rider id',
  riderPick: 'Rider',
  assign: 'Assign rider',
  handoff: 'Pickup OTP',
  handoffHint:
    'Show this code to the rider at handoff. Never share the customer delivery OTP.',
  success: 'Last Core response',
  refundCopy: 'Refund is eventual after Core accepts the rejection.',
} as const;

import type { FinanceScreen, PageMeta } from '@medmate/finance-contract';

export const SCREEN_COPY: Record<
  FinanceScreen,
  { title: string; helper: string; kicker: string }
> = {
  settlements: {
    title: 'Settlements',
    helper:
      'Weekly marketplace payouts from Core. Amounts are not recalculated.',
    kicker: 'Finance',
  },
  'settlement-detail': {
    title: 'Settlement',
    helper: 'Core fields only. Open support to dispute a line.',
    kicker: 'Finance',
  },
};

export function rootTestId(screen: FinanceScreen): string {
  return `finance-${screen}-page`;
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

export const LIST_COPY = {
  tableLabel: 'Settlement history',
  empty: 'No settlement payouts have been released yet.',
  retry: 'Retry',
  previous: 'Previous page',
  next: 'Next page',
  page: 'Page',
  open: 'Open',
} as const;

export const DETAIL_COPY = {
  notFound: 'This settlement was not found.',
  retry: 'Retry',
  support: 'Raise a support ticket',
  fields: 'Settlement fields',
} as const;

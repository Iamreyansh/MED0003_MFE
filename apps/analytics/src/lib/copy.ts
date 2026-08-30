import type { AnalyticsTab, PageMeta } from '@medmate/analytics-contract';

export const SCREEN_COPY = {
  title: 'Analytics',
  helper:
    'Growth insights from Core. Amounts stay in paise; no invented series.',
  kicker: 'Reports',
} as const;

export const TAB_COPY: Record<AnalyticsTab, string> = {
  overview: 'Overview',
  'sales-register': 'Sales register',
  products: 'Products',
  gst: 'GST',
  reports: 'Reports',
};

export function rootTestId(): string {
  return 'analytics-analytics-page';
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

export const SHARED_COPY = {
  retry: 'Retry',
  previous: 'Previous page',
  next: 'Next page',
  page: 'Page',
  period: 'Period',
  dateFrom: 'From',
  dateTo: 'To',
  apply: 'Apply dates',
  viewPlans: 'View plans',
  emptyOverview: 'No analytics for this period yet.',
  emptySales: 'No sales register rows for this period.',
  emptyProducts: 'No product performance rows for this period.',
  emptyGst: 'No GST working papers for this period.',
  emptyReports: 'No reports are available.',
  emptyReport: 'This report has no rows.',
  reportMissing: 'This report was not found.',
  forbidden: 'You do not have permission to do that.',
  salesLabel: 'Sales register — not the POS ledger',
  favorite: 'Favorite',
  unfavorite: 'Remove favorite',
  openReport: 'Open report',
  fyHint: 'Indian FY is 1 April to 31 March. Core computes the window.',
} as const;

export function favoriteLabel(isFavorite: boolean): string {
  return isFavorite ? SHARED_COPY.unfavorite : SHARED_COPY.favorite;
}

export function favoriteTestId(reportId: string | null | undefined): string {
  if (reportId) {
    return `analytics-favorite-${reportId}`;
  }
  return 'analytics-favorite-row';
}

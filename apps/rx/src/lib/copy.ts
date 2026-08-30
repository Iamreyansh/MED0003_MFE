import type { PageMeta, RxScreen } from '@medmate/rx-contract';

export const SCREEN_COPY: Record<
  RxScreen,
  { title: string; helper: string; kicker: string }
> = {
  queue: {
    title: 'Prescriptions',
    helper: 'Review pending prescriptions before they become bills.',
    kicker: 'Fulfilment',
  },
  detail: {
    title: 'Prescription',
    helper: 'Lines, schedule flags, and pharmacist actions from Core.',
    kicker: 'Fulfilment',
  },
  'drug-register': {
    title: 'Drug register',
    helper: 'Read-only H1/X dispense rows. Available on Free and above.',
    kicker: 'Fulfilment',
  },
};

export function rootTestId(screen: RxScreen): string {
  return `rx-${screen}-page`;
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

export function yesNo(value: unknown): string {
  if (value === true) {
    return 'Yes';
  }
  if (value === false) {
    return 'No';
  }
  return '—';
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

export const QUEUE_COPY = {
  tableLabel: 'Prescription queue',
  empty: 'No prescriptions in this filter.',
  open: 'Open',
  status: 'Status',
  allStatuses: 'All statuses',
  retry: 'Retry',
  previous: 'Previous page',
  next: 'Next page',
  page: 'Page',
  viewPlans: 'View plans',
  scheduleH1: 'H1',
  scheduleX: 'X',
} as const;

export const DETAIL_COPY = {
  notFound: 'This prescription is no longer available.',
  retry: 'Retry',
  lines: 'Lines',
  linesHint: 'Quantities and schedule flags as returned by Core.',
  emptyLines: 'No lines on this prescription.',
  schedule: 'Schedule',
  timestamps: 'Timestamps',
  image: 'Prescription image',
  approve: 'Approve',
  reject: 'Reject',
  rejectTitle: 'Reject this prescription?',
  rejectHelp: 'Core requires a reason before the prescription is rejected.',
  rejectReason: 'Rejection reason',
  rejectConfirm: 'Confirm reject',
  cancel: 'Cancel',
  dispense: 'Dispense',
  dispenseTitle: 'Dispense this prescription?',
  dispenseHelp: 'Core records the dispense and writes the H1/X register.',
  controlledHelp:
    'This prescription includes Schedule H1 or X drugs. Confirm before dispensing.',
  dispenseConfirm: 'Confirm dispense',
  viewPlans: 'View plans',
} as const;

export const REGISTER_COPY = {
  tableLabel: 'Drug register',
  empty: 'No register rows match these filters.',
  fromDate: 'From date',
  toDate: 'To date',
  schedule: 'Schedule',
  allSchedules: 'All schedules',
  retry: 'Retry',
  previous: 'Previous page',
  next: 'Next page',
  page: 'Page',
  retention: 'Retention',
  retentionHint: 'Owner-only guidance authored by Core.',
} as const;

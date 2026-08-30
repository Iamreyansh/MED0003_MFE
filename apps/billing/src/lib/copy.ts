import type { BillingScreen, PageMeta } from '@medmate/billing-contract';

export const SCREEN_COPY: Record<
  BillingScreen,
  { title: string; helper: string; kicker: string }
> = {
  invoices: {
    title: 'Invoices',
    helper: 'GST invoices from the counter and online orders.',
    kicker: 'Money',
  },
  'invoice-detail': {
    title: 'Invoice',
    helper: 'Line items, GST slabs, PDF, and share.',
    kicker: 'Money',
  },
  'invoice-settings': {
    title: 'Invoice settings',
    helper:
      'Legal identity printed on GST invoices. Preview is not a legal PDF.',
    kicker: 'Money',
  },
  sales: {
    title: 'Sales ledger',
    helper: 'Day close from Core totals. Do not treat this as analytics.',
    kicker: 'Money',
  },
};

export function rootTestId(screen: BillingScreen): string {
  return `billing-${screen}-page`;
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

export function textOrEmpty(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

export const INVOICES_COPY = {
  tableLabel: 'GST invoices',
  sectionTitle: 'Invoices',
  sectionHint: 'Paginated invoices for this pharmacy.',
  empty: 'No invoices yet. Open POS to create the first bill.',
  openPos: 'Open POS',
  open: 'Open',
  exportExcel: 'Export Excel',
  downloadPdf: 'Download PDF',
  fromDate: 'From date',
  toDate: 'To date',
  channel: 'Channel',
  paymentMethod: 'Payment method',
  search: 'Search',
  retry: 'Retry',
  previous: 'Previous page',
  next: 'Next page',
  page: 'Page',
} as const;

export const DETAIL_COPY = {
  lines: 'Line items',
  linesHint: 'Quantities and GST as returned by Core.',
  gst: 'GST breakdown',
  gstHint: 'Slabs from the invoice payload. Totals are not recomputed here.',
  share: 'Share invoice',
  shareHint: 'Channel must be one Core implements: WhatsApp, SMS, or email.',
  channel: 'Share channel',
  recipient: 'Phone or email',
  send: 'Share',
  downloadPdf: 'Download PDF',
  notFound: 'This invoice is no longer available.',
  retry: 'Retry',
  pharmacy: 'Pharmacy',
  customer: 'Customer',
} as const;

export const SETTINGS_COPY = {
  sectionTitle: 'Invoice identity',
  sectionHint:
    'These fields print on GST invoices. GSTIN is edited on profile.',
  save: 'Save settings',
  template: 'Template',
  accent: 'Accent colour',
  logo: 'Logo URL',
  signature: 'Signature URL',
  title: 'Document title',
  prefix: 'Invoice prefix',
  signatory: 'Signatory label',
  bankName: 'Bank name',
  account: 'Account number',
  ifsc: 'IFSC',
  upi: 'UPI id',
  terms: 'Terms and conditions',
  footer: 'Footer note',
  showMrp: 'Show MRP savings',
  showDoctor: 'Show prescribing doctor',
  showHsn: 'Show HSN',
  printBank: 'Print bank details',
  identityGroup: 'Identity',
  bankGroup: 'Bank details',
  printGroup: 'Print options',
  staffReadOnly: 'Only the owner can change invoice settings.',
  dirtyLeave: 'Invoice settings have not been saved.',
  retry: 'Retry',
  viewPlans: 'View plans',
} as const;

export const SALES_COPY = {
  tableLabel: 'Sales ledger',
  sectionTitle: 'Ledger',
  sectionHint: 'Sales rows for the selected period.',
  empty: 'No sales in this period.',
  open: 'Open',
  exportExcel: 'Export Excel',
  fromDate: 'From date',
  toDate: 'To date',
  channel: 'Channel',
  paymentMethod: 'Payment method',
  paymentStatus: 'Payment status',
  search: 'Search',
  retry: 'Retry',
  previous: 'Previous page',
  next: 'Next page',
  page: 'Page',
  closeDetail: 'Close sale',
  markPaid: 'Mark paid',
  confirmTitle: 'Record this payment?',
  confirmHelp: 'Core records the amount against the outstanding sale.',
  cancel: 'Cancel',
  confirm: 'Confirm payment',
  paymentMode: 'Payment mode',
  amount: 'Amount',
  reference: 'Reference number',
  note: 'Note',
  kpiBills: 'Bills',
  kpiRevenue: 'Revenue',
  kpiGst: 'GST collected',
  kpiAvg: 'Average bill',
} as const;

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
  khata: {
    title: 'Khata',
    helper: 'Neighbourhood credit balances from Core. Starter plan or higher.',
    kicker: 'Money',
  },
  'khata-detail': {
    title: 'Khata customer',
    helper: 'Ledger, unpaid bills, repayment, and reminders.',
    kicker: 'Money',
  },
  offers: {
    title: 'Offers',
    helper:
      'Local schemes for the counter and storefront. Growth plan or higher.',
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

export const KHATA_COPY = {
  tableLabel: 'Khata customers',
  sectionTitle: 'Outstanding',
  sectionHint: 'Customers with an open credit balance.',
  historyTitle: 'Payment history',
  historyHint: 'Repayments collected in the selected period.',
  historyTableLabel: 'Khata repayments',
  empty: 'No customers with outstanding credit.',
  historyEmpty: 'No repayments in this period.',
  open: 'Open',
  exportExcel: 'Export Excel',
  overdueOnly: 'Overdue only',
  sort: 'Sort',
  search: 'Search',
  retry: 'Retry',
  previous: 'Previous page',
  next: 'Next page',
  page: 'Page',
  kpiOutstanding: 'Outstanding',
  kpiOverdue: 'Overdue 30d',
  kpiCollected: 'Collected this month',
  kpiRate: 'Collection rate',
  agingCurrent: '0–30 days',
  agingMid: '31–60 days',
  agingOld: '60+ days',
  overdue: 'Overdue',
  current: 'Current',
  viewPlans: 'View plans',
  debtors: 'Debtors',
  payments: 'Payments',
} as const;

export const KHATA_DETAIL_COPY = {
  notFound: 'This customer is no longer on the khata.',
  retry: 'Retry',
  customer: 'Customer',
  outstanding: 'Outstanding',
  overdue: 'Overdue',
  creditLimit: 'Credit limit',
  utilisation: 'Utilisation',
  unpaid: 'Unpaid bills',
  unpaidHint: 'Open credit invoices from Core.',
  unpaidEmpty: 'No unpaid bills.',
  ledger: 'Ledger',
  ledgerHint: 'Reverse-chronological entries with running balance.',
  ledgerEmpty: 'No ledger entries.',
  repay: 'Record repayment',
  repayHint: 'Core records the amount against this customer.',
  repayTitle: 'Record this repayment?',
  confirm: 'Confirm repayment',
  cancel: 'Cancel',
  amount: 'Amount',
  paymentMode: 'Payment mode',
  note: 'Note',
  remind: 'Send reminder',
  remindHint: 'Owner-only. Core sends an approved template.',
  remindTitle: 'Send a payment reminder?',
  remindConfirm: 'Send reminder',
  channel: 'Channel',
  template: 'Template',
  staffRemind: 'Only the owner can send reminders.',
  viewPlans: 'View plans',
} as const;

export const OFFERS_COPY = {
  tableLabel: 'Pharmacy offers',
  sectionTitle: 'Offers',
  sectionHint: 'Local schemes. Platform coupons are not listed here.',
  empty: 'No offers yet.',
  create: 'Create offer',
  edit: 'Edit',
  save: 'Save offer',
  cancel: 'Cancel',
  toggleOn: 'Deactivate offer',
  toggleOff: 'Activate offer',
  delete: 'Delete',
  deleteTitle: 'Delete this offer?',
  deleteHelp:
    'Offers with redemptions are expired instead of permanently deleted.',
  confirmDelete: 'Confirm delete',
  validate: 'Validate coupon',
  validateHint: 'Same Core check POS uses at checkout.',
  coupon: 'Coupon code',
  cartTotal: 'Cart total',
  runValidate: 'Check coupon',
  valid: 'Coupon is valid',
  invalid: 'Coupon is not valid',
  status: 'Status',
  retry: 'Retry',
  previous: 'Previous page',
  next: 'Next page',
  page: 'Page',
  title: 'Title',
  discountType: 'Discount type',
  discountValue: 'Discount value',
  appliesTo: 'Applies to',
  validFrom: 'Valid from',
  validUntil: 'Valid until',
  maxRedemptions: 'Max redemptions',
  online: 'Online storefront',
  counter: 'Counter',
  kpiActive: 'Active offers',
  kpiRedemptions: 'Redemptions',
  editorTitle: 'Offer',
  editorHint: 'Dates are stored as Core calendar days and shown in IST.',
  staffReadOnly: 'Only the owner can create or change offers.',
  viewPlans: 'View plans',
} as const;

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

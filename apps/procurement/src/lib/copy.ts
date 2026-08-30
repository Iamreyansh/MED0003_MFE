import type {
  PageMeta,
  ProcurementScreen,
} from '@medmate/procurement-contract';
import { CSV_COLUMNS } from '@medmate/procurement-contract';

export const SCREEN_COPY: Record<
  ProcurementScreen,
  { title: string; helper: string; kicker: string }
> = {
  purchases: {
    title: 'Purchases',
    helper: 'Goods receipt notes become batches after save-and-stock.',
    kicker: 'Stock in',
  },
  editor: {
    title: 'GRN editor',
    helper: 'Invoice lines, batches, and stock-in for one receipt.',
    kicker: 'Receipt',
  },
  distributors: {
    title: 'Distributors',
    helper: 'Supplier directory, supply list, and landed-cost compare.',
    kicker: 'Growth',
  },
  reorder: {
    title: 'Reorder',
    helper: 'Suggestions from Core, then draft and send purchase orders.',
    kicker: 'Growth',
  },
};

export function rootTestId(screen: ProcurementScreen): string {
  return `procurement-${screen}-page`;
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

export function qtyInput(
  edited: string | undefined,
  quantity: unknown,
): string {
  if (edited !== undefined) {
    return edited;
  }
  if (quantity === null || quantity === undefined) {
    return '';
  }
  return String(quantity);
}

export function firstText(...values: unknown[]): string {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== '') {
      return String(value);
    }
  }
  return '—';
}

export const PURCHASES_COPY = {
  tableLabel: 'Goods receipt notes',
  sectionTitle: 'Receipts',
  sectionHint: 'Draft, saved, and stocked GRNs for this pharmacy.',
  empty: 'No receipts yet. Create a GRN or import a distributor invoice.',
  create: 'Create GRN',
  importCsv: 'Import CSV',
  distributorId: 'Distributor id',
  walkInHint: 'Uses Cash / Walk-in',
  invoiceNumber: 'Invoice number',
  invoiceDate: 'Invoice date',
  retry: 'Retry',
  previous: 'Previous page',
  next: 'Next page',
  page: 'Page',
  kpiMonth: 'Purchases this month',
  kpiGst: 'Input GST this month',
  kpiTotal: 'Total GRNs',
  status: 'Status',
  open: 'Open',
} as const;

export const CSV_COPY = {
  title: 'CSV import',
  hint: `Columns: ${CSV_COLUMNS}`,
  file: 'Invoice CSV',
  upload: 'Upload preview',
  confirm: 'Confirm import',
  cancel: 'Cancel',
  unmatched: 'Unmatched rows',
  tooLarge: 'File must be 10MB or smaller.',
  previewReady: 'Preview ready. Confirm to create unmatched products.',
} as const;

export const EDITOR_COPY = {
  items: 'Line items',
  itemsHint:
    'Paid quantity drives taxable amount. Free quantity is extra stock.',
  addItem: 'Add line',
  saveAndStock: 'Save and stock',
  productId: 'Product id',
  batchNumber: 'Batch number',
  expiry: 'Expiry date',
  paidQuantity: 'Paid quantity',
  quantity: 'Line quantity',
  freeQuantity: 'Free quantity',
  purchasePrice: 'Purchase price',
  mrp: 'MRP',
  gst: 'GST %',
  delete: 'Remove',
  saveQty: 'Save quantity',
  stocked: 'This receipt is stocked. Lines cannot be edited.',
  notFound: 'This receipt is no longer available.',
  retry: 'Retry',
  product: 'Open product',
  staffHidden: 'Only the owner can stock this receipt.',
} as const;

export const DISTRIBUTORS_COPY = {
  tableLabel: 'Distributors',
  sectionTitle: 'Directory',
  sectionHint: 'Suppliers this pharmacy buys from.',
  empty: 'No distributors yet. Add a firm to start comparing prices.',
  create: 'Add distributor',
  firmName: 'Firm name',
  contactName: 'Contact name',
  phone: 'Phone',
  email: 'Email',
  gstin: 'GSTIN',
  licence: 'Drug licence',
  address: 'Address',
  terms: 'Payment terms (days)',
  credit: 'Credit limit',
  delete: 'Delete',
  confirmDelete: 'Delete this distributor?',
  confirmDeleteHelp: 'This removes the firm from the directory.',
  cancel: 'Keep distributor',
  supply: 'Supply list',
  compare: 'Price compare',
  compareLabel: 'Price comparison',
  preferred: 'Set preferred',
  preferredMark: 'Preferred',
  retry: 'Retry',
  previous: 'Previous page',
  next: 'Next page',
  page: 'Page',
  viewPlans: 'View plans',
} as const;

export const REORDER_COPY = {
  suggestions: 'Suggestions',
  suggestionsHint: 'Core recalculates these. Do not edit quantities by hand.',
  empty: 'No items below reorder level.',
  refresh: 'Refresh suggestions',
  createPo: 'Create purchase order',
  purchaseOrders: 'Purchase orders',
  poHint: 'Draft, send, then record the incoming invoice as a GRN.',
  send: 'Send PO',
  confirmSend: 'Send this purchase order?',
  confirmSendHelp: 'Core will mark the PO as sent on the chosen channel.',
  cancel: 'Keep draft',
  channel: 'Channel',
  recordGrn: 'Record GRN',
  invoiceNumber: 'Invoice number',
  invoiceDate: 'Invoice date',
  addLine: 'Add line',
  productId: 'Product id',
  quantity: 'Quantity',
  retry: 'Retry',
  previous: 'Previous page',
  next: 'Next page',
  page: 'Page',
  viewPlans: 'View plans',
  poEditor: 'Purchase order',
} as const;

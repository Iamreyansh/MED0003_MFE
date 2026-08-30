import type { InventoryScreen } from '@medmate/inventory-contract';

export const SCREEN_COPY: Record<
  InventoryScreen,
  { title: string; helper: string; kicker: string }
> = {
  list: {
    title: 'Inventory',
    helper: 'Stock on hand for this pharmacy. Batches live on each product.',
    kicker: 'Stock master',
  },
  detail: {
    title: 'Product stock',
    helper: 'FEFO batches, rack, and online listing for one SKU.',
    kicker: 'Product',
  },
  expiry: {
    title: 'Expiry watch',
    helper: 'Near-expiry batches before they reach the counter.',
    kicker: 'FEFO',
  },
  racks: {
    title: 'Racks',
    helper: 'Shelf codes so staff can find a strip without hunting.',
    kicker: 'Locations',
  },
};

export function rootTestId(screen: InventoryScreen): string {
  return `inventory-${screen}-page`;
}

export const LIST_COPY = {
  tableLabel: 'Inventory products',
  sectionTitle: 'Stock on hand',
  sectionHint: 'Quantities, rack codes, and storefront listing.',
  empty: 'No stock yet. Map a medicine or receive a purchase first.',
  catalogueCta: 'Open catalogue',
  purchasesCta: 'Open purchases',
  expiryCta: 'Expiry watch',
  export: 'Export Excel',
  search: 'Search inventory',
  retry: 'Retry',
  previous: 'Previous page',
  next: 'Next page',
  page: 'Page',
  readOnly: 'This account can view stock but cannot change it.',
  kpiProducts: 'Products',
  kpiUnits: 'Units',
  kpiLowStock: 'Low stock',
  kpiNearExpiry: 'Near expiry',
  nearExpiryAction: 'View near-expiry batches',
  listed: 'Listed',
  hidden: 'Hidden',
} as const;

export const DETAIL_COPY = {
  batches: 'Batches',
  batchesHint: 'FEFO order. Earliest expiry is used first.',
  settingsTitle: 'Listing and shelf',
  settingsHint: 'Online visibility, rack, and selling rules.',
  addBatch: 'Add batch',
  adjust: 'Adjust quantity',
  writeOff: 'Write off',
  confirmWriteOff: 'Write off this batch?',
  confirmWriteOffHelp:
    'Confirm the quantity and reason. This removes stock from FEFO.',
  cancel: 'Keep batch',
  saveDetails: 'Save details',
  saveRack: 'Save rack',
  rack: 'Rack location code',
  loose: 'Allow loose selling',
  reorder: 'Reorder level',
  online: 'List on online storefront',
  storefrontOffline:
    'This SKU is listed online, but the storefront is offline.',
  notFound: 'This product is no longer available.',
  retry: 'Retry',
  quantity: 'Batch quantity',
  adjustQuantity: 'Adjusted quantity',
  writeOffQuantity: 'Write-off quantity',
  batchNumber: 'Batch number',
  expiry: 'Expiry date',
  reason: 'Write-off reason',
  close: 'Close',
  save: 'Save',
  unitsOnHand: 'Units on hand',
  noRack: 'No rack',
  listed: 'Listed',
  hidden: 'Hidden',
  readOnlyBatches: 'Add and write-off actions are hidden.',
} as const;

export const EXPIRY_COPY = {
  alerts: 'Expiry alerts',
  alertsHint: 'Batches that need to move before they reach the counter.',
  report: 'Expiry report',
  reportHint: 'Full expiry report for this pharmacy.',
  empty: 'No near-expiry batches.',
  export: 'Export report',
  retry: 'Retry',
  tableLabel: 'Near-expiry batches',
  reportLabel: 'Expiry report',
  dateUnavailable: 'Date unavailable',
  expired: 'Expired',
  today: 'Today',
} as const;

export const RACKS_COPY = {
  tableLabel: 'Rack locations',
  shelvesTitle: 'Shelf codes',
  shelvesHint: 'Printable locations assigned to stock.',
  createHint: 'Add a code staff can read from the aisle.',
  empty: 'No racks yet. Create a shelf code to start assigning stock.',
  create: 'Create rack',
  code: 'Rack code',
  zone: 'Zone name',
  zoneRequired: 'Enter a zone name.',
  name: 'Rack name',
  unlocated: 'Unlocated products',
  assign: 'Assign rack',
  rack: 'Rack',
  product: 'Product',
  print: 'Print labels',
  delete: 'Delete rack',
  confirmDelete: 'Delete this rack?',
  confirmDeleteHelp: 'Products on this rack become unlocated.',
  cancel: 'Keep rack',
  notFound: 'This rack is no longer available.',
  retry: 'Retry',
  save: 'Save rack',
  selectProduct: 'Select product',
  selectRack: 'Select rack',
  startWithA1: 'Start with A1',
} as const;

export function unlocatedHint(count: number): string {
  return count === 1
    ? '1 product without a shelf code.'
    : `${count} products without a shelf code.`;
}

export function daysUntilLabel(days: number | null): string {
  if (days === null) {
    return EXPIRY_COPY.dateUnavailable;
  }
  if (days < 0) {
    return EXPIRY_COPY.expired;
  }
  if (days === 0) {
    return EXPIRY_COPY.today;
  }
  return days === 1 ? '1 day' : `${days} days`;
}

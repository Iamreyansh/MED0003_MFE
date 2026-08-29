import type { CatalogueScreen } from '@medmate/catalogue-contract';

export const SCREEN_COPY: Record<
  CatalogueScreen,
  { title: string; helper: string; kicker: string }
> = {
  search: {
    title: 'Catalogue search',
    helper: 'Find master SKUs before you map them to this pharmacy.',
    kicker: 'Master index',
  },
  mapping: {
    title: 'Catalogue mapping',
    helper: 'Bind pharmacy prices and online visibility to master medicines.',
    kicker: 'Storefront SKUs',
  },
};

export function rootTestId(screen: CatalogueScreen): string {
  return `catalogue-${screen}-page`;
}

export const SEARCH_COPY = {
  label: 'Search medicines',
  hint: 'Type at least 2 characters to search master SKUs.',
  empty: 'No medicines match this search.',
  results: 'Search results',
  mapped: 'Mapped',
  unmapped: 'Unmapped',
  map: 'Map',
  viewMappings: 'View mappings',
  retry: 'Retry search',
  previous: 'Previous page',
  next: 'Next page',
  page: 'Page',
} as const;

export const MAPPING_COPY = {
  tableLabel: 'Catalogue mappings',
  empty: 'No mappings yet. Search the catalogue to add the first SKU.',
  searchCta: 'Search catalogue',
  create: 'Map a medicine',
  edit: 'Edit mapping',
  delete: 'Delete mapping',
  confirmDelete: 'Remove this mapping from the online store?',
  confirmDeleteHelp:
    'Physical inventory is not affected. Confirm only after you intend to hide this SKU online.',
  cancel: 'Keep mapping',
  save: 'Save mapping',
  close: 'Close',
  medicineId: 'Master medicine ID',
  invalidMedicineId:
    'Use the UUID from catalogue search. A short code like 1 is not a medicine ID.',
  price: 'Pharmacy price (₹)',
  stock: 'Mapping stock quantity',
  visible: 'Visible on online storefront',
  retry: 'Retry',
  previous: 'Previous page',
  next: 'Next page',
  stockNote:
    'Mapping stock quantity is not batch inventory. Use Inventory for FEFO batches and write-offs.',
  inventory: 'Open inventory',
  staffView:
    'Staff can edit mapped prices and visibility. Only the owner can create or delete mappings.',
} as const;

import type { MfeDataEnvelope } from '@medmate/contracts';
import type {
  InventoryFeatureData,
  InventoryScreen,
  InventorySubmitResult,
} from '@medmate/inventory-contract';
import { createMfeEnvelope } from '@medmate/test-utils';

export function feature(
  screen: InventoryScreen,
  onSubmit: InventoryFeatureData['onSubmit'] = async () => ({ ok: true }),
  extra: Partial<InventoryFeatureData> = {},
): InventoryFeatureData {
  return {
    screen,
    onSubmit,
    role: 'pharmacy_owner',
    plan: 'RETAIL_PRO',
    canWrite: true,
    canPatchDetails: true,
    canWriteOff: true,
    canManageRacks: true,
    canToggleOnline: true,
    storefrontOnline: true,
    productId: screen === 'detail' ? 'prod-1' : null,
    ...extra,
  };
}

export function data(
  next: InventoryFeatureData,
  extra: Partial<MfeDataEnvelope<InventoryFeatureData>> = {},
) {
  return {
    ...createMfeEnvelope({
      feature: next,
      context: { hostId: 'test-host', locale: 'en-IN', permissions: [] },
    }),
    ...extra,
  };
}

export const LIST_ROWS: InventorySubmitResult = {
  ok: true,
  products: [
    {
      product_id: 'prod-1',
      name: 'Crocin 500mg Tablet',
      stock_quantity: 48,
      rack_location_code: 'A1',
      is_online_visible: false,
    },
  ],
  meta: { page: 1, limit: 20, total: 1, has_next: true },
};

export const SUMMARY: InventorySubmitResult = {
  ok: true,
  summary: {
    total_products: 12,
    total_quantity: 240,
    low_stock: 2,
    near_expiry: 1,
  },
};

export const PRODUCT: InventorySubmitResult = {
  ok: true,
  product: {
    product_id: 'prod-1',
    name: 'Crocin 500mg Tablet',
    stock_quantity: 48,
    rack_location_code: 'A1',
    is_online_visible: false,
    allow_loose_selling: false,
    reorder_level: 10,
  },
};

export const BATCHES: InventorySubmitResult = {
  ok: true,
  batches: [
    {
      batch_id: 'batch-1',
      batch_number: 'B1',
      expiry_date: '2026-12-01',
      quantity: 20,
    },
  ],
};

export const ALERTS: InventorySubmitResult = {
  ok: true,
  alerts: [
    {
      product_id: 'prod-1',
      name: 'Crocin 500mg Tablet',
      expiry_date: '2026-09-15',
      quantity: 4,
    },
  ],
};

export const RACKS: InventorySubmitResult = {
  ok: true,
  racks: [
    {
      rack_code: 'A1',
      name: 'Counter left',
      description: 'Counter left',
      zone_name: 'OTC',
      product_count: 3,
      medicine_count: 3,
    },
  ],
};

export const UNLOCATED: InventorySubmitResult = {
  ok: true,
  unlocated: [{ product_id: 'prod-2', name: 'Augmentin 625 Tablet' }],
};

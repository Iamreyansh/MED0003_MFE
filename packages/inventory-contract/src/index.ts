export const INVENTORY_SCREENS = ['list', 'detail', 'expiry', 'racks'] as const;

export type InventoryScreen = (typeof INVENTORY_SCREENS)[number];

export type PharmacyRole = 'pharmacy_owner' | 'pharmacy_staff';

export type PlanCode = 'FREE' | 'STARTER' | 'RETAIL_PRO' | 'ENTERPRISE';

export type PageMeta = {
  page?: number;
  limit?: number;
  total?: number;
  has_next?: boolean;
  total_pages?: number;
};

export type InventoryProduct = {
  product_id: string;
  name?: string | null;
  medicine_name?: string | null;
  sku?: string | null;
  stock_quantity?: number | null;
  rack_location_code?: string | null;
  is_online_visible?: boolean | null;
  allow_loose_selling?: boolean | null;
  reorder_level?: number | null;
  schedule?: string | null;
};

export type InventorySummary = {
  total_products?: number | null;
  total_quantity?: number | null;
  low_stock?: number | null;
  near_expiry?: number | null;
  unlocated?: number | null;
};

export type InventoryBatch = {
  batch_id: string;
  product_id?: string | null;
  batch_number?: string | null;
  expiry_date?: string | null;
  quantity?: number | null;
};

export type ExpiryAlert = {
  product_id: string;
  name?: string | null;
  medicine_name?: string | null;
  batch_id?: string | null;
  expiry_date?: string | null;
  quantity?: number | null;
};

export type RackLocation = {
  rack_code: string;
  name?: string | null;
  description?: string | null;
  zone_name?: string | null;
  product_count?: number | null;
  medicine_count?: number | null;
};

export type UnlocatedProduct = {
  product_id: string;
  name?: string | null;
  medicine_name?: string | null;
};

export type InventoryCommand =
  | {
      screen: 'list';
      action: 'load';
      values?: {
        page?: number;
        limit?: number;
        search?: string;
      };
    }
  | { screen: 'list'; action: 'loadSummary' }
  | { screen: 'list'; action: 'export'; values?: { format?: string } }
  | { screen: 'detail'; action: 'load'; values: { product_id: string } }
  | {
      screen: 'detail';
      action: 'patchProduct';
      values: {
        product_id: string;
        is_online_visible?: boolean;
        rack_location_code?: string;
        allow_loose_selling?: boolean;
        reorder_level?: number;
      };
    }
  | {
      screen: 'detail';
      action: 'patchDetails';
      values: {
        product_id: string;
        allow_loose_selling?: boolean;
        reorder_level?: number;
      };
    }
  | {
      screen: 'detail';
      action: 'patchRack';
      values: { product_id: string; rack_location_code: string };
    }
  | { screen: 'detail'; action: 'loadBatches'; values: { product_id: string } }
  | {
      screen: 'detail';
      action: 'addBatch';
      values: {
        product_id: string;
        batch_number?: string;
        expiry_date?: string;
        quantity: number;
      };
    }
  | {
      screen: 'detail';
      action: 'adjustBatch';
      values: {
        product_id: string;
        batch_id: string;
        quantity: number;
      };
    }
  | {
      screen: 'detail';
      action: 'writeOff';
      values: {
        product_id: string;
        batch_id: string;
        quantity?: number;
        reason?: string;
      };
    }
  | { screen: 'expiry'; action: 'loadAlerts' }
  | { screen: 'expiry'; action: 'loadReport' }
  | { screen: 'expiry'; action: 'exportReport' }
  | { screen: 'racks'; action: 'load' }
  | {
      screen: 'racks';
      action: 'create';
      values: {
        rack_code: string;
        zone_name: string;
        name?: string;
        description?: string;
      };
    }
  | { screen: 'racks'; action: 'loadUnlocated' }
  | {
      screen: 'racks';
      action: 'assign';
      values: { product_id: string; rack_code: string };
    }
  | {
      screen: 'racks';
      action: 'printLabels';
      values?: { rack_codes?: string[] };
    }
  | { screen: 'racks'; action: 'loadOne'; values: { rack_code: string } }
  | { screen: 'racks'; action: 'delete'; values: { rack_code: string } };

export type InventorySubmitSuccess = {
  ok: true;
  products?: InventoryProduct[];
  product?: InventoryProduct | null;
  summary?: InventorySummary | null;
  batches?: InventoryBatch[];
  alerts?: ExpiryAlert[];
  report?: ExpiryAlert[];
  racks?: RackLocation[];
  rack?: RackLocation | null;
  unlocated?: UnlocatedProduct[];
  meta?: PageMeta;
  downloaded?: boolean;
  printed?: boolean;
  deleted?: boolean;
};

export type InventorySubmitFailure = {
  ok: false;
  fieldErrors?: Record<string, string>;
  formError?: string;
  code?: string;
};

export type InventorySubmitResult =
  InventorySubmitSuccess | InventorySubmitFailure;

export type InventoryFeatureData = {
  screen: InventoryScreen;
  onSubmit: (command: InventoryCommand) => Promise<InventorySubmitResult>;
  role?: PharmacyRole | null;
  plan?: PlanCode | null;
  canWrite?: boolean;
  canPatchDetails?: boolean;
  canWriteOff?: boolean;
  canManageRacks?: boolean;
  canToggleOnline?: boolean;
  storefrontOnline?: boolean | null;
  productId?: string | null;
  errors?: Record<string, string>;
  formError?: string;
  busy?: boolean;
  disabled?: boolean;
};

export function isInventoryScreen(value: unknown): value is InventoryScreen {
  return (
    typeof value === 'string' &&
    (INVENTORY_SCREENS as readonly string[]).includes(value)
  );
}

export function isInventoryFeatureData(
  value: unknown,
): value is InventoryFeatureData {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const feature = value as Partial<InventoryFeatureData>;
  return (
    isInventoryScreen(feature.screen) && typeof feature.onSubmit === 'function'
  );
}

export function productDisplayName(
  row:
    | Pick<InventoryProduct, 'name' | 'medicine_name' | 'product_id'>
    | Pick<ExpiryAlert, 'name' | 'medicine_name' | 'product_id'>
    | Pick<UnlocatedProduct, 'name' | 'medicine_name' | 'product_id'>,
): string {
  if (typeof row.name === 'string' && row.name.trim()) {
    return row.name;
  }
  if (typeof row.medicine_name === 'string' && row.medicine_name.trim()) {
    return row.medicine_name;
  }
  return 'Product';
}

export function formatIstDate(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
  }).format(date);
}

function expiryTime(value?: string | null): number {
  const time = Date.parse(value ?? '');
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
}

export function sortBatchesByExpiry(
  batches: readonly InventoryBatch[],
): InventoryBatch[] {
  return [...batches].sort(
    (left, right) =>
      expiryTime(left.expiry_date) - expiryTime(right.expiry_date),
  );
}

export function isNegativeQty(value: unknown): boolean {
  return typeof value === 'number' && value < 0;
}

export function isProductNotFound(code: unknown): boolean {
  return code === 'PRODUCT_NOT_FOUND';
}

export function isRackNotFound(code: unknown): boolean {
  return code === 'RACK_NOT_FOUND';
}

export function isPlanFeatureLocked(code: unknown): boolean {
  return code === 'PLAN_FEATURE_LOCKED' || code === 'MODULE_NOT_IN_PLAN';
}

export function onlineVisibilityLockCopy(): string {
  return 'Listing stock online is available on Growth.';
}

export function parsePositiveQty(value: string): number | null {
  if (value.trim() === '') {
    return null;
  }
  const qty = Number(value);
  if (!Number.isFinite(qty) || qty < 0) {
    return null;
  }
  return qty;
}

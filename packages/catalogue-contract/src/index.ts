export const CATALOGUE_SCREENS = ['search', 'mapping'] as const;

export type CatalogueScreen = (typeof CATALOGUE_SCREENS)[number];

export type PharmacyRole = 'pharmacy_owner' | 'pharmacy_staff';

export const MIN_QUERY_LENGTH = 2;

export const SEARCH_DEBOUNCE_MS = 300;

export type PageMeta = {
  page?: number;
  limit?: number;
  total?: number;
  has_next?: boolean;
  total_pages?: number;
};

export type CatalogueSearchResult = {
  source?: string | null;
  medicine_id: string;
  name: string;
  salt_composition?: string | null;
  manufacturer?: string | null;
  form?: string | null;
  pack_size?: number | null;
  schedule?: string | null;
  is_rx_only?: boolean | null;
  master_mrp?: number | null;
  pharmacy_price?: number | null;
  stock_quantity?: number | null;
  mapping_id?: string | null;
  is_mapped?: boolean | null;
  is_visible?: boolean | null;
};

export type ScheduleRule = {
  schedule: string;
  full_name?: string | null;
  description?: string | null;
  prescription_required?: boolean | null;
  special_register_required?: boolean | null;
  online_delivery_allowed?: boolean | null;
};

export type CatalogueMappingRow = {
  mapping_id: string;
  master_medicine_id: string;
  name?: string | null;
  medicine_name?: string | null;
  salt_composition?: string | null;
  manufacturer?: string | null;
  form?: string | null;
  pack_size?: number | null;
  schedule?: string | null;
  is_rx_only?: boolean | null;
  master_mrp?: number | null;
  mrp_ceiling?: number | null;
  pharmacy_price?: number | null;
  stock_quantity?: number | null;
  is_visible?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CatalogueCommand =
  | {
      screen: 'search';
      action: 'search';
      values: {
        q: string;
        page?: number;
        limit?: number;
        source?: string;
        in_stock_only?: boolean;
        show_oos?: boolean;
      };
    }
  | { screen: 'search'; action: 'loadScheduleRules' }
  | {
      screen: 'mapping';
      action: 'load';
      values?: {
        page?: number;
        limit?: number;
        search?: string;
        is_visible?: boolean;
        in_stock?: boolean;
        sort?: string;
        order?: string;
      };
    }
  | {
      screen: 'mapping';
      action: 'create';
      values: {
        master_medicine_id: string;
        pharmacy_price: number;
        stock_quantity: number;
      };
    }
  | {
      screen: 'mapping';
      action: 'update';
      values: {
        mapping_id: string;
        pharmacy_price?: number;
        stock_quantity?: number;
        is_visible?: boolean;
      };
    }
  | {
      screen: 'mapping';
      action: 'delete';
      values: { mapping_id: string };
    };

export type CatalogueSubmitSuccess = {
  ok: true;
  results?: CatalogueSearchResult[];
  mappings?: CatalogueMappingRow[];
  mapping?: CatalogueMappingRow | null;
  meta?: PageMeta;
  scheduleRules?: ScheduleRule[];
  deleted?: boolean;
};

export type CatalogueSubmitFailure = {
  ok: false;
  fieldErrors?: Record<string, string>;
  formError?: string;
  code?: string;
};

export type CatalogueSubmitResult =
  CatalogueSubmitSuccess | CatalogueSubmitFailure;

export type CatalogueFeatureData = {
  screen: CatalogueScreen;
  onSubmit: (command: CatalogueCommand) => Promise<CatalogueSubmitResult>;
  role?: PharmacyRole | null;
  canCreate?: boolean;
  canDelete?: boolean;
  canPatch?: boolean;
  createFromMedicineId?: string | null;
  errors?: Record<string, string>;
  formError?: string;
  busy?: boolean;
  disabled?: boolean;
};

export const SCHEDULE_FALLBACK: Record<string, string> = {
  OTC: 'Over-the-counter',
  H: 'Schedule H',
  H1: 'Schedule H1',
  X: 'Schedule X',
};

export function isCatalogueScreen(value: unknown): value is CatalogueScreen {
  return (
    typeof value === 'string' &&
    (CATALOGUE_SCREENS as readonly string[]).includes(value)
  );
}

export function isCatalogueFeatureData(
  value: unknown,
): value is CatalogueFeatureData {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const feature = value as Partial<CatalogueFeatureData>;
  return (
    isCatalogueScreen(feature.screen) && typeof feature.onSubmit === 'function'
  );
}

export function scheduleDisplayLabel(
  schedule: string | null | undefined,
  rules?: ScheduleRule[] | null,
): string {
  if (!schedule) {
    return 'Unspecified';
  }
  const fromRule = rules?.find((rule) => rule.schedule === schedule);
  if (fromRule?.full_name) {
    return fromRule.full_name;
  }
  return SCHEDULE_FALLBACK[schedule] ?? `Schedule ${schedule}`;
}

export function mappingDisplayName(row: CatalogueMappingRow): string {
  if (typeof row.name === 'string' && row.name.trim()) {
    return row.name;
  }
  if (typeof row.medicine_name === 'string' && row.medicine_name.trim()) {
    return row.medicine_name;
  }
  return 'Medicine';
}

export function isPriceAboveMrp(code: unknown): boolean {
  return code === 'PRICE_ABOVE_MRP';
}

export function isScheduleXOnlineRejected(code: unknown): boolean {
  return code === 'SCHEDULE_X_NOT_AVAILABLE_ONLINE';
}

export function isQueryTooShort(code: unknown): boolean {
  return code === 'QUERY_TOO_SHORT' || code === 'VALIDATION_ERROR';
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

export function rupeeLabel(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  return `₹${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

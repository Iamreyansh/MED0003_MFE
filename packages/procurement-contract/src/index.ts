export const PROCUREMENT_SCREENS = [
  'purchases',
  'editor',
  'distributors',
  'reorder',
] as const;

export type ProcurementScreen = (typeof PROCUREMENT_SCREENS)[number];

export type PharmacyRole = 'pharmacy_owner' | 'pharmacy_staff';

export type PlanCode = 'FREE' | 'STARTER' | 'RETAIL_PRO' | 'ENTERPRISE';

export type GrnStatus = 'DRAFT' | 'SAVED' | 'STOCKED';

export type PoStatus = 'DRAFT' | 'SENT' | 'RECEIVED' | 'CANCELLED';

export type PageMeta = {
  page?: number;
  limit?: number;
  total?: number;
  has_next?: boolean;
  total_pages?: number;
};

export const CSV_MAX_BYTES = 10 * 1024 * 1024;

export const CSV_COLUMNS =
  'product_name,manufacturer,batch_number,expiry_date,quantity,free_quantity,purchase_price,mrp,gst_pct';

export type PurchaseKpi = {
  purchases_this_month?: number | null;
  input_gst_credit_this_month?: number | null;
  total_grns?: number | null;
};

export type GrnListRow = {
  grn_id: string;
  distributor_name?: string | null;
  invoice_number?: string | null;
  invoice_date?: string | null;
  line_count?: number | null;
  taxable_amount?: number | null;
  gst_amount?: number | null;
  total?: number | null;
  status?: GrnStatus | string | null;
  created_at?: string | null;
};

export type GrnItem = {
  item_id: string;
  grn_id?: string | null;
  product_id?: string | null;
  product_name?: string | null;
  is_new_product?: boolean | null;
  batch_number?: string | null;
  expiry_date?: string | null;
  quantity?: number | null;
  free_quantity?: number | null;
  quantity_total?: number | null;
  purchase_price_per_unit?: number | null;
  mrp_per_unit?: number | null;
  gst_pct?: number | null;
  taxable_amount?: number | null;
  gst_amount?: number | null;
  line_total?: number | null;
};

export type GrnTotals = {
  taxable_amount?: number | null;
  gst_amount?: number | null;
  grand_total?: number | null;
  input_gst_credit?: number | null;
};

export type GrnDetail = {
  grn_id: string;
  distributor?: { id?: string | null; firm_name?: string | null } | null;
  invoice_number?: string | null;
  invoice_date?: string | null;
  status?: GrnStatus | string | null;
  items?: GrnItem[];
  totals?: GrnTotals | null;
};

export type GrnStockResult = {
  grn_id?: string | null;
  status?: GrnStatus | string | null;
  line_count?: number | null;
  new_products_created?: number | null;
  batches_created?: number | null;
  total_units_added?: number | null;
  updated_stock_summary?: Array<{ product_id?: string | null }> | null;
};

export type CsvUnmatchedItem = {
  row_number?: number | null;
  raw_data?: { product_name?: string | null; manufacturer?: string | null };
  suggested_action?: string | null;
};

export type CsvImportPreview = {
  grn_id?: string | null;
  total_rows?: number | null;
  matched_rows?: number | null;
  unmatched_rows?: number | null;
  status?: GrnStatus | string | null;
  preview_items?: GrnItem[];
  unmatched_items?: CsvUnmatchedItem[];
};

export type DistributorKpi = {
  distributor_count?: number | null;
  products_sourced?: number | null;
  outstanding_payable?: number | null;
  on_credit_count?: number | null;
};

export type Distributor = {
  id: string;
  firm_name?: string | null;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  gstin?: string | null;
  drug_licence_number?: string | null;
  address?: string | null;
  outstanding_payable?: number | null;
  on_credit?: boolean | null;
  credit_limit?: number | null;
  payment_terms_days?: number | null;
  is_active?: boolean | null;
  last_purchase_date?: string | null;
};

export type SupplyItem = {
  product_id: string;
  product_name?: string | null;
  manufacturer?: string | null;
  purchase_price?: number | null;
  scheme_free_qty?: string | null;
  effective_landed_cost?: number | null;
  mrp?: number | null;
  margin_pct?: number | null;
  price_rank?: number | null;
  is_preferred_source?: boolean | null;
};

export type PriceCompareRow = {
  product_id: string;
  product_name?: string | null;
  manufacturer?: string | null;
  distributor_prices?: Array<{
    distributor_id?: string | null;
    distributor_name?: string | null;
    purchase_price?: number | null;
    effective_landed_cost?: number | null;
    mrp?: number | null;
    is_preferred_source?: boolean | null;
    price_rank?: number | null;
  }>;
};

export type ReorderKpi = {
  items_below_reorder_level?: number | null;
  distributors_to_order_from?: number | null;
  estimated_savings?: number | null;
  open_pos_count?: number | null;
  last_refreshed_at?: string | null;
};

export type ReorderSuggestion = {
  product_id: string;
  product_name?: string | null;
  quantity?: number | null;
  distributor_id?: string | null;
  distributor_name?: string | null;
  urgency?: string | null;
};

export type SuggestionGroup = {
  key?: string | null;
  label?: string | null;
  distributor_id?: string | null;
  distributor_name?: string | null;
  items?: ReorderSuggestion[];
};

export type PurchaseOrder = {
  po_id: string;
  po_number?: string | null;
  distributor_id?: string | null;
  distributor_name?: string | null;
  items_count?: number | null;
  estimated_total?: number | null;
  status?: PoStatus | string | null;
  created_at?: string | null;
  sent_at?: string | null;
};

export type PoLine = {
  product_id: string;
  quantity: number;
  product_name?: string | null;
  item_id?: string | null;
};

export type RecordGrnResult = {
  grn_id?: string | null;
  grn_status?: GrnStatus | string | null;
  po_id?: string | null;
  prefilled_items_count?: number | null;
  message?: string | null;
};

export type GrnItemValues = {
  grn_id: string;
  product_id?: string;
  batch_number?: string;
  expiry_date?: string;
  quantity: number;
  free_quantity?: number;
  purchase_price_per_unit?: number;
  mrp_per_unit?: number;
  gst_pct?: number;
};

export type DistributorValues = {
  id?: string;
  firm_name?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  drug_licence_number?: string;
  address?: string;
  payment_terms_days?: number;
  credit_limit?: number;
  is_active?: boolean;
};

export type ProcurementCommand =
  | {
      screen: 'purchases';
      action: 'load';
      values?: {
        page?: number;
        limit?: number;
        status?: string;
        q?: string;
      };
    }
  | {
      screen: 'purchases';
      action: 'create';
      values: {
        distributor_id?: string;
        invoice_number: string;
        invoice_date: string;
      };
    }
  | {
      screen: 'purchases';
      action: 'importCsv';
      values: {
        file: File;
        distributor_id?: string;
        invoice_number: string;
        invoice_date: string;
      };
    }
  | {
      screen: 'purchases';
      action: 'confirmImport';
      values: { grn_id: string };
    }
  | { screen: 'editor'; action: 'load'; values: { grn_id: string } }
  | { screen: 'editor'; action: 'addItem'; values: GrnItemValues }
  | {
      screen: 'editor';
      action: 'patchItem';
      values: { grn_id: string; item_id: string; quantity: number };
    }
  | {
      screen: 'editor';
      action: 'deleteItem';
      values: { grn_id: string; item_id: string };
    }
  | { screen: 'editor'; action: 'saveAndStock'; values: { grn_id: string } }
  | {
      screen: 'distributors';
      action: 'load';
      values?: { page?: number; limit?: number; is_active?: boolean };
    }
  | { screen: 'distributors'; action: 'create'; values: DistributorValues }
  | { screen: 'distributors'; action: 'patch'; values: DistributorValues }
  | { screen: 'distributors'; action: 'delete'; values: { id: string } }
  | {
      screen: 'distributors';
      action: 'loadSupply';
      values: { id: string; page?: number; limit?: number };
    }
  | {
      screen: 'distributors';
      action: 'setPreferred';
      values: { id: string; product_id: string };
    }
  | {
      screen: 'distributors';
      action: 'loadPriceCompare';
      values?: {
        only_multi_source?: boolean;
        page?: number;
        limit?: number;
      };
    }
  | {
      screen: 'reorder';
      action: 'load';
      values?: { group_by?: string; page?: number; limit?: number };
    }
  | { screen: 'reorder'; action: 'refresh' }
  | {
      screen: 'reorder';
      action: 'createPo';
      values: { distributor_id: string; items: PoLine[] };
    }
  | {
      screen: 'reorder';
      action: 'loadPurchaseOrders';
      values?: { status?: string; page?: number; limit?: number };
    }
  | {
      screen: 'reorder';
      action: 'patchPo';
      values: {
        po_id: string;
        add_items?: PoLine[];
        remove_item_ids?: string[];
        update_items?: Array<{ item_id: string; quantity: number }>;
      };
    }
  | {
      screen: 'reorder';
      action: 'send';
      values: { po_id: string; channel?: string };
    }
  | {
      screen: 'reorder';
      action: 'recordGrn';
      values: {
        po_id: string;
        invoice_number: string;
        invoice_date: string;
      };
    };

export type ProcurementSubmitSuccess = {
  ok: true;
  kpi?: PurchaseKpi | DistributorKpi | ReorderKpi | null;
  grns?: GrnListRow[];
  grn?: GrnDetail | GrnListRow | GrnStockResult | null;
  item?: GrnItem | null;
  items?: GrnItem[];
  importPreview?: CsvImportPreview | null;
  itemsCreated?: number | null;
  distributors?: Distributor[];
  distributor?: Distributor | null;
  supplyItems?: SupplyItem[];
  compare?: PriceCompareRow[];
  suggestionGroups?: SuggestionGroup[];
  purchaseOrders?: PurchaseOrder[];
  purchaseOrder?: PurchaseOrder | null;
  recordGrn?: RecordGrnResult | null;
  refreshedAt?: string | null;
  meta?: PageMeta;
  deleted?: boolean;
};

export type ProcurementSubmitFailure = {
  ok: false;
  fieldErrors?: Record<string, string>;
  formError?: string;
  code?: string;
};

export type ProcurementSubmitResult =
  ProcurementSubmitSuccess | ProcurementSubmitFailure;

export type ProcurementFeatureData = {
  screen: ProcurementScreen;
  onSubmit: (command: ProcurementCommand) => Promise<ProcurementSubmitResult>;
  role?: PharmacyRole | null;
  plan?: PlanCode | null;
  canWrite?: boolean;
  canStockIn?: boolean;
  canAccessGrowth?: boolean;
  canMutateDistributors?: boolean;
  canPriceCompare?: boolean;
  canRefreshReorder?: boolean;
  canSendPo?: boolean;
  grnId?: string | null;
  errors?: Record<string, string>;
  formError?: string;
  busy?: boolean;
  disabled?: boolean;
};

export function isProcurementScreen(
  value: unknown,
): value is ProcurementScreen {
  return (
    typeof value === 'string' &&
    (PROCUREMENT_SCREENS as readonly string[]).includes(value)
  );
}

export function isProcurementFeatureData(
  value: unknown,
): value is ProcurementFeatureData {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const feature = value as Partial<ProcurementFeatureData>;
  return (
    isProcurementScreen(feature.screen) &&
    typeof feature.onSubmit === 'function'
  );
}

export function isGrnNotFound(code: unknown): boolean {
  return code === 'GRN_NOT_FOUND';
}

export function isDistributorNotFound(code: unknown): boolean {
  return code === 'DISTRIBUTOR_NOT_FOUND';
}

export function isPoNotFound(code: unknown): boolean {
  return code === 'PO_NOT_FOUND';
}

export function isStaffCannotStock(code: unknown): boolean {
  return code === 'STAFF_CANNOT_STOCK';
}

export function isPlanFeatureLocked(code: unknown): boolean {
  return code === 'PLAN_FEATURE_LOCKED' || code === 'MODULE_NOT_IN_PLAN';
}

export function distributorsLockCopy(): string {
  return 'Distributor directory is available on Growth.';
}

export function reorderLockCopy(): string {
  return 'Reorder suggestions are available on Growth.';
}

export function isCsvTooLarge(file: { size: number }): boolean {
  return file.size > CSV_MAX_BYTES;
}

export function formatInr(value: unknown): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
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

export const POS_SCREENS = ['counter'] as const;

export type PosScreen = (typeof POS_SCREENS)[number];

export type PharmacyRole = 'pharmacy_owner' | 'pharmacy_staff';

export type PlanCode = 'FREE' | 'STARTER' | 'RETAIL_PRO' | 'ENTERPRISE';

export type TokenScope = 'full' | 'pos';

export type CartStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED' | string;

export type SearchMode = 'TEXT' | 'BARCODE';

export type DiscountType = 'FLAT_RS' | 'PERCENTAGE';

export const PAYMENT_METHODS = [
  'CASH',
  'UPI',
  'CARD',
  'COD',
  'CREDIT',
  'INSURANCE_TPA',
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const SEARCH_MODES = ['TEXT', 'BARCODE'] as const;

export const DISCOUNT_TYPES = ['FLAT_RS', 'PERCENTAGE'] as const;

export const POS_API_PATH_PREFIX = '/api/v1/pharmacy/pos/';

export type PosCustomer = {
  customer_id: string;
  name?: string | null;
  phone?: string | null;
};

export type PosCartItem = {
  item_id: string;
  product_id?: string | null;
  product_name?: string | null;
  batch_id?: string | null;
  batch_number?: string | null;
  expiry_date?: string | null;
  quantity?: number | null;
  is_loose?: boolean | null;
  unit_price?: number | null;
  gst_pct?: number | null;
  line_subtotal?: number | null;
  gst_amount?: number | null;
  line_total?: number | null;
  is_rx_only?: boolean | null;
};

export type AppliedOffer = {
  offer_id: string;
  title?: string | null;
  coupon_code?: string | null;
  discount_type?: string | null;
  discount_value?: number | null;
  discount_amount?: number | null;
};

export type PosCart = {
  cart_id: string;
  status?: CartStatus | null;
  customer?: PosCustomer | null;
  prescribing_doctor?: string | null;
  items?: PosCartItem[];
  rx_items_present?: boolean | null;
  discount_type?: DiscountType | string | null;
  discount_value?: number | null;
  subtotal?: number | null;
  gst_total?: number | null;
  discount_amount?: number | null;
  grand_total?: number | null;
  applied_offers?: AppliedOffer[];
  expires_at?: string | null;
  created_at?: string | null;
};

export type PosCartLine = {
  item_id: string;
  product_name?: string | null;
  batch_number?: string | null;
  expiry_date?: string | null;
  quantity?: number | null;
  is_loose?: boolean | null;
  unit_price?: number | null;
  gst_pct?: number | null;
  line_total?: number | null;
  gst_amount?: number | null;
  cart_grand_total?: number | null;
};

export type PosSearchBatch = {
  batch_id: string;
  batch_number?: string | null;
  expiry_date?: string | null;
  quantity_current?: number | null;
  is_fefo_first?: boolean | null;
};

export type PosSearchHit = {
  product_id: string;
  name?: string | null;
  manufacturer?: string | null;
  form?: string | null;
  pack_size?: number | null;
  mrp?: number | null;
  total_stock_units?: number | null;
  is_rx_only?: boolean | null;
  is_loose_selling_enabled?: boolean | null;
  rack_locations?: string[] | null;
  available_batches?: PosSearchBatch[];
  auto_add?: boolean | null;
};

export type PosSearchResult = {
  results?: PosSearchHit[];
  mode?: SearchMode | string | null;
  query?: string | null;
};

export type PosAttachedCustomer = {
  customer_id: string;
  name?: string | null;
  phone?: string | null;
  is_new_customer?: boolean | null;
  outstanding_khata?: number | null;
};

export type PosDiscountResult = {
  discount_type?: DiscountType | string | null;
  discount_value?: number | null;
  discount_amount?: number | null;
  grand_total?: number | null;
};

export type GstBreakdownRow = {
  slab?: string | null;
  taxable_amount?: number | null;
  gst_amount?: number | null;
};

export type PosReceipt = {
  invoice_id: string;
  invoice_number?: string | null;
  cart_id?: string | null;
  payment_method?: PaymentMethod | string | null;
  amount_paid?: number | null;
  change_due?: number | null;
  grand_total?: number | null;
  gst_breakdown?: GstBreakdownRow[];
  invoice_pdf_url?: string | null;
  items_count?: number | null;
  customer_name?: string | null;
  completed_at?: string | null;
  idempotent_replay?: boolean | null;
};

export type PosCommand =
  | { screen: 'counter'; action: 'createCart' }
  | { screen: 'counter'; action: 'loadCart'; values?: { cart_id?: string } }
  | {
      screen: 'counter';
      action: 'search';
      values: { query: string; mode: SearchMode };
    }
  | {
      screen: 'counter';
      action: 'addItem';
      values: {
        product_id: string;
        quantity: number;
        batch_id?: string;
        is_loose?: boolean;
      };
    }
  | {
      screen: 'counter';
      action: 'patchItem';
      values: {
        item_id: string;
        quantity?: number;
        batch_id?: string;
        is_loose?: boolean;
      };
    }
  | { screen: 'counter'; action: 'deleteItem'; values: { item_id: string } }
  | { screen: 'counter'; action: 'clearCart' }
  | {
      screen: 'counter';
      action: 'attachCustomer';
      values: { customer_phone: string; customer_name?: string };
    }
  | {
      screen: 'counter';
      action: 'applyDiscount';
      values: { type: DiscountType; value: number };
    }
  | {
      screen: 'counter';
      action: 'checkout';
      values: {
        payment_method: PaymentMethod;
        amount_paid?: number;
        upi_reference?: string;
        prescribing_doctor?: string;
      };
    };

export type PosSubmitSuccess = {
  ok: true;
  cart?: PosCart | null;
  item?: PosCartLine | null;
  search?: PosSearchResult | null;
  customer?: PosAttachedCustomer | null;
  discount?: PosDiscountResult | null;
  receipt?: PosReceipt | null;
  cleared?: boolean;
  deleted?: boolean;
};

export type PosSubmitFailure = {
  ok: false;
  fieldErrors?: Record<string, string>;
  formError?: string;
  code?: string;
};

export type PosSubmitResult = PosSubmitSuccess | PosSubmitFailure;

export type PosFeatureData = {
  screen: PosScreen;
  onSubmit: (command: PosCommand) => Promise<PosSubmitResult>;
  role?: PharmacyRole | null;
  plan?: PlanCode | null;
  tokenScope?: TokenScope | null;
  cartId?: string | null;
  canSell?: boolean;
  errors?: Record<string, string>;
  formError?: string;
  busy?: boolean;
  disabled?: boolean;
};

export function isPosScreen(value: unknown): value is PosScreen {
  return (
    typeof value === 'string' &&
    (POS_SCREENS as readonly string[]).includes(value)
  );
}

export function isPosFeatureData(value: unknown): value is PosFeatureData {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const feature = value as Partial<PosFeatureData>;
  return isPosScreen(feature.screen) && typeof feature.onSubmit === 'function';
}

export function isPharmacyPosApiPath(path: string): boolean {
  const q = path.indexOf('?');
  const pathname = q === -1 ? path : path.slice(0, q);
  return pathname.startsWith(POS_API_PATH_PREFIX);
}

export function isCartStale(code: unknown): boolean {
  return code === 'CART_NOT_FOUND' || code === 'CART_EXPIRED';
}

export function isInsufficientStock(code: unknown): boolean {
  return code === 'INSUFFICIENT_STOCK';
}

export function isPosTokenRestricted(code: unknown): boolean {
  return code === 'POS_TOKEN_RESTRICTED';
}

export function isModuleNotInPlan(code: unknown): boolean {
  return code === 'MODULE_NOT_IN_PLAN';
}

export const MAX_MANUAL_DISCOUNT_PCT = 30;

export function asRupees(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const amount = Number(value);
    if (Number.isFinite(amount)) {
      return amount;
    }
  }
  return null;
}

export function formatInr(value: unknown): string {
  const amount = asRupees(value);
  if (amount === null) {
    return '—';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function parsePositiveQty(value: string): number | null {
  if (value.trim() === '') {
    return null;
  }
  const qty = Number(value);
  if (!Number.isFinite(qty) || qty <= 0) {
    return null;
  }
  return qty;
}

export function parseDiscountInput(value: string): number | null {
  const trimmed = value.trim().replace(/%$/u, '').trim();
  if (trimmed === '') {
    return null;
  }
  const amount = Number(trimmed);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  return amount;
}

export function paymentMethodLabel(method: PaymentMethod): string {
  if (method === 'CASH') {
    return 'Cash';
  }
  if (method === 'UPI') {
    return 'UPI';
  }
  if (method === 'CARD') {
    return 'Card';
  }
  if (method === 'COD') {
    return 'Cash on delivery';
  }
  if (method === 'CREDIT') {
    return 'Khata / credit';
  }
  return 'Insurance / TPA';
}

export function openAfterFullLoginCopy(): string {
  return 'Open this invoice after a full login.';
}

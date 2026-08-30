export const BILLING_SCREENS = [
  'invoices',
  'invoice-detail',
  'invoice-settings',
  'sales',
] as const;

export type BillingScreen = (typeof BILLING_SCREENS)[number];

export type PharmacyRole = 'pharmacy_owner' | 'pharmacy_staff';

export type PlanCode = 'FREE' | 'STARTER' | 'RETAIL_PRO' | 'ENTERPRISE';

export type InvoiceChannel = 'COUNTER' | 'ONLINE' | string;

export type PaymentMethod =
  'CASH' | 'UPI' | 'CARD' | 'COD' | 'CREDIT' | 'INSURANCE_TPA' | string;

export type PaymentStatus = 'PAID' | 'PENDING' | 'PARTIAL' | string;

export type ShareChannel = 'WHATSAPP' | 'SMS' | 'EMAIL';

export type InvoiceTemplate = 'MODERN' | 'MINIMAL' | 'THERMAL' | string;

export type MarkPaidMode = 'CASH' | 'UPI' | 'CARD';

export type PageMeta = {
  page?: number;
  limit?: number;
  total?: number;
  has_next?: boolean;
  total_pages?: number;
};

export type InvoiceListRow = {
  invoice_id: string;
  invoice_number?: string | null;
  date?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  channel?: InvoiceChannel | null;
  payment_method?: PaymentMethod | null;
  items_count?: number | null;
  grand_total?: number | null;
  gst_total?: number | null;
  payment_status?: PaymentStatus | null;
};

export type InvoiceLineItem = {
  product_name?: string | null;
  hsn_code?: string | null;
  batch_number?: string | null;
  expiry_date?: string | null;
  pack_size?: string | null;
  quantity?: number | null;
  unit_price?: number | null;
  line_subtotal?: number | null;
  gst_pct?: number | null;
  gst_amount?: number | null;
  line_total?: number | null;
};

export type GstSlab = {
  slab?: string | null;
  hsn_code?: string | null;
  taxable_amount?: number | null;
  cgst?: number | null;
  sgst?: number | null;
};

export type InvoiceDetail = {
  invoice_id: string;
  invoice_number?: string | null;
  date?: string | null;
  channel?: InvoiceChannel | null;
  pharmacy?: {
    name?: string | null;
    address?: string | null;
    phone?: string | null;
    gstin?: string | null;
    drug_licence?: string | null;
  } | null;
  customer?: { name?: string | null; phone?: string | null } | null;
  prescribing_doctor?: string | null;
  line_items?: InvoiceLineItem[];
  subtotal?: number | null;
  discount_amount?: number | null;
  gst_breakdown?: GstSlab[];
  grand_total?: number | null;
  payment_method?: PaymentMethod | null;
  payment_status?: PaymentStatus | null;
  mrp_savings?: number | null;
  payment_reference?: string | null;
};

export type InvoiceShareResult = {
  channel?: ShareChannel | string | null;
  recipient?: string | null;
  message_id?: string | null;
  sent_at?: string | null;
};

export type InvoiceBankDetails = {
  bank_name?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  upi_id?: string | null;
};

export type InvoiceSettings = {
  template?: InvoiceTemplate | null;
  accent_color?: string | null;
  logo_url?: string | null;
  signature_url?: string | null;
  document_title?: string | null;
  invoice_prefix?: string | null;
  signatory_label?: string | null;
  bank_details?: InvoiceBankDetails | null;
  terms_and_conditions?: string | null;
  footer_note?: string | null;
  show_mrp_savings?: boolean | null;
  show_doctor?: boolean | null;
  show_hsn?: boolean | null;
  print_bank_details?: boolean | null;
  updated_at?: string | null;
};

export type InvoiceSettingsPatch = {
  template?: string;
  accent_color?: string;
  logo_url?: string;
  signature_url?: string;
  document_title?: string;
  invoice_prefix?: string;
  signatory_label?: string;
  bank_details?: InvoiceBankDetails;
  terms_and_conditions?: string;
  footer_note?: string;
  show_mrp_savings?: boolean;
  show_doctor?: boolean;
  show_hsn?: boolean;
  print_bank_details?: boolean;
};

export type SalesListRow = {
  sale_id: string;
  invoice_number?: string | null;
  date?: string | null;
  channel?: InvoiceChannel | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  items_count?: number | null;
  grand_total?: number | null;
  gst_total?: number | null;
  payment_method?: PaymentMethod | null;
  payment_status?: PaymentStatus | null;
};

export type SalesPeriodSummary = {
  from_date?: string | null;
  to_date?: string | null;
  bill_count?: number | null;
  units_sold?: number | null;
  gross_revenue?: number | null;
  gst_collected?: number | null;
  net_collected?: number | null;
  credit_outstanding?: number | null;
};

export type PaymentModeMix = Record<
  string,
  { count?: number | null; amount?: number | null }
>;

export type SalesSummary = {
  period?: { from?: string | null; to?: string | null } | null;
  total_bills?: number | null;
  total_revenue?: number | null;
  avg_bill_value?: number | null;
  online_vs_counter?: {
    online_revenue?: number | null;
    online_pct?: number | null;
    counter_revenue?: number | null;
    counter_pct?: number | null;
  } | null;
  payment_mode_mix?: PaymentModeMix | null;
  top_selling_categories?: unknown[];
  top_selling_products?: Array<{
    product_name?: string | null;
    revenue?: number | null;
    units?: number | null;
  }>;
};

export type SaleDetail = InvoiceDetail & {
  sale_id?: string | null;
};

export type MarkPaidResult = {
  sale_id?: string | null;
  invoice_number?: string | null;
  previous_payment_status?: PaymentStatus | null;
  new_payment_status?: PaymentStatus | null;
  amount_settled?: number | null;
  settled_at?: string | null;
  receipt_number?: string | null;
};

export type InvoiceListQuery = {
  page?: number;
  limit?: number;
  from_date?: string;
  to_date?: string;
  payment_method?: string;
  channel?: string;
  q?: string;
};

export type SalesListQuery = InvoiceListQuery & {
  payment_status?: string;
  sort?: string;
  order?: string;
  financial_year?: string;
};

export type BillingCommand =
  | { screen: 'invoices'; action: 'load'; values?: InvoiceListQuery }
  | { screen: 'invoices'; action: 'exportExcel'; values?: InvoiceListQuery }
  | {
      screen: 'invoices';
      action: 'pdf';
      values: { invoiceId: string; template?: string };
    }
  | { screen: 'invoice-detail'; action: 'load'; values: { invoiceId: string } }
  | {
      screen: 'invoice-detail';
      action: 'pdf';
      values: { invoiceId: string; template?: string };
    }
  | {
      screen: 'invoice-detail';
      action: 'share';
      values: {
        invoiceId: string;
        channel: ShareChannel;
        recipient_phone_or_email: string;
      };
    }
  | { screen: 'invoice-settings'; action: 'load' }
  | {
      screen: 'invoice-settings';
      action: 'save';
      values: InvoiceSettingsPatch;
    }
  | { screen: 'sales'; action: 'load'; values?: SalesListQuery }
  | {
      screen: 'sales';
      action: 'loadSummary';
      values?: { from_date?: string; to_date?: string };
    }
  | { screen: 'sales'; action: 'loadSale'; values: { saleId: string } }
  | { screen: 'sales'; action: 'exportExcel'; values?: SalesListQuery }
  | {
      screen: 'sales';
      action: 'markPaid';
      values: {
        saleId: string;
        payment_mode: MarkPaidMode;
        amount: number;
        reference_number?: string;
        note?: string;
      };
    };

export type BillingSubmitSuccess = {
  ok: true;
  invoices?: InvoiceListRow[];
  invoice?: InvoiceDetail | null;
  share?: InvoiceShareResult | null;
  settings?: InvoiceSettings | null;
  sales?: SalesListRow[];
  sale?: SaleDetail | null;
  summary?: SalesSummary | null;
  period_summary?: SalesPeriodSummary | null;
  markPaid?: MarkPaidResult | null;
  meta?: PageMeta;
  downloaded?: boolean;
};

export type BillingSubmitFailure = {
  ok: false;
  fieldErrors?: Record<string, string>;
  formError?: string;
  code?: string;
};

export type BillingSubmitResult = BillingSubmitSuccess | BillingSubmitFailure;

export type BillingFeatureData = {
  screen: BillingScreen;
  onSubmit: (command: BillingCommand) => Promise<BillingSubmitResult>;
  role?: PharmacyRole | null;
  plan?: PlanCode | null;
  canPatchSettings?: boolean;
  canMarkPaid?: boolean;
  invoiceId?: string | null;
  errors?: Record<string, string>;
  formError?: string;
  busy?: boolean;
  disabled?: boolean;
};

export function isBillingScreen(value: unknown): value is BillingScreen {
  return (
    typeof value === 'string' &&
    (BILLING_SCREENS as readonly string[]).includes(value)
  );
}

export function isBillingFeatureData(
  value: unknown,
): value is BillingFeatureData {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const feature = value as Partial<BillingFeatureData>;
  return (
    isBillingScreen(feature.screen) && typeof feature.onSubmit === 'function'
  );
}

export function isInvoiceNotFound(code: unknown): boolean {
  return code === 'INVOICE_NOT_FOUND';
}

export function isSaleNotFound(code: unknown): boolean {
  return code === 'SALE_NOT_FOUND';
}

export function isStaffCannotMarkPaid(code: unknown): boolean {
  return code === 'STAFF_CANNOT_MARK_PAID';
}

export function isPlanFeatureLocked(code: unknown): boolean {
  return code === 'PLAN_FEATURE_LOCKED' || code === 'MODULE_NOT_IN_PLAN';
}

export function billingLockCopy(): string {
  return 'Billing is not included in the current plan.';
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

export const SHARE_CHANNELS: ShareChannel[] = ['WHATSAPP', 'SMS', 'EMAIL'];

export const MARK_PAID_MODES: MarkPaidMode[] = ['CASH', 'UPI', 'CARD'];

export const INVOICE_TEMPLATES = ['MODERN', 'MINIMAL', 'THERMAL'] as const;

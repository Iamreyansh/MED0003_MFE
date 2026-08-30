export const BILLING_SCREENS = [
  'invoices',
  'invoice-detail',
  'invoice-settings',
  'sales',
  'khata',
  'khata-detail',
  'offers',
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

export type RepayMode = 'CASH' | 'UPI' | 'CARD';

export type RemindChannel = 'WHATSAPP' | 'SMS';

export type RemindTemplate = 'POLITE' | 'FIRM';

export type DiscountType = 'PERCENTAGE' | 'FLAT_RS';

export type OfferAppliesTo = 'ALL' | 'CATEGORY' | 'PRODUCT';

export type OfferStatusFilter = 'ACTIVE' | 'EXPIRED' | 'ALL';

export type OfferDeleteAction = 'HARD_DELETED' | 'SET_EXPIRED';

export type KhataListQuery = {
  page?: number;
  limit?: number;
  overdue_only?: boolean;
  sort?: string;
  q?: string;
};

export type KhataHistoryQuery = {
  page?: number;
  limit?: number;
  from_date?: string;
  to_date?: string;
  payment_mode?: string;
  q?: string;
};

export type KhataKpi = {
  total_outstanding?: number | null;
  overdue_30d?: number | null;
  collected_this_month?: number | null;
  collection_rate_pct?: number | null;
  all_time_credit_given?: number | null;
};

export type KhataAging = {
  current_0_30d?: number | null;
  overdue_31_60d?: number | null;
  overdue_60d_plus?: number | null;
};

export type KhataCustomerRow = {
  customer_id: string;
  name?: string | null;
  phone?: string | null;
  outstanding?: number | null;
  oldest_unpaid_date?: string | null;
  days_overdue?: number | null;
  is_overdue?: boolean | null;
};

export type KhataUnpaidBill = {
  invoice_id?: string | null;
  invoice_number?: string | null;
  invoice_date?: string | null;
  amount?: number | null;
  days_since?: number | null;
};

export type KhataLedgerEntry = {
  entry_id?: string | null;
  type?: 'DEBIT' | 'CREDIT' | string | null;
  date?: string | null;
  reference?: string | null;
  amount?: number | null;
  running_balance?: number | null;
};

export type KhataDetail = {
  customer?: {
    customer_id?: string | null;
    name?: string | null;
    phone?: string | null;
    credit_limit?: number | null;
  } | null;
  summary?: {
    total_outstanding?: number | null;
    overdue_amount?: number | null;
    oldest_unpaid_days?: number | null;
    credit_utilisation_pct?: number | null;
  } | null;
  unpaid_bills?: KhataUnpaidBill[];
  ledger?: KhataLedgerEntry[];
  total_outstanding?: number | null;
};

export type KhataPaymentRow = {
  receipt_id?: string | null;
  receipt_number?: string | null;
  date?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  mode?: string | null;
  amount?: number | null;
  note?: string | null;
  running_outstanding_after?: number | null;
};

export type KhataRepaymentResult = {
  receipt_id?: string | null;
  receipt_number?: string | null;
  customer_name?: string | null;
  amount?: number | null;
  payment_mode?: string | null;
  previous_outstanding?: number | null;
  new_outstanding?: number | null;
  receipt_pdf_url?: string | null;
  created_at?: string | null;
};

export type KhataRemindResult = {
  channel?: string | null;
  template?: string | null;
  sent_to?: string | null;
  outstanding_amount?: number | null;
  message_id?: string | null;
  sent_at?: string | null;
};

export type OfferKpi = {
  active_count?: number | null;
  total_redemptions?: number | null;
};

export type OfferRow = {
  offer_id: string;
  title?: string | null;
  coupon_code?: string | null;
  discount_type?: DiscountType | string | null;
  discount_value?: number | null;
  applies_to?: OfferAppliesTo | string | null;
  category_names?: string[] | null;
  is_online?: boolean | null;
  is_counter?: boolean | null;
  valid_from?: string | null;
  valid_until?: string | null;
  max_redemptions?: number | null;
  total_redemptions?: number | null;
  is_active?: boolean | null;
  is_expired?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type OfferWrite = {
  title: string;
  coupon_code?: string;
  discount_type: DiscountType;
  discount_value: number;
  applies_to: OfferAppliesTo;
  category_ids?: string[];
  product_ids?: string[];
  is_online?: boolean;
  is_counter?: boolean;
  valid_from: string;
  valid_until: string;
  max_redemptions?: number;
};

export type OfferPatch = Partial<OfferWrite>;

export type OfferToggleResult = {
  offer_id?: string | null;
  is_active?: boolean | null;
  toggled_at?: string | null;
};

export type OfferDeleteResult = {
  offer_id?: string | null;
  action?: OfferDeleteAction | string | null;
  message?: string | null;
  valid_until?: string | null;
};

export type OfferValidateQuery = {
  coupon_code: string;
  cart_total: number;
  product_ids?: string[];
};

export type OfferValidateResult = {
  is_valid?: boolean | null;
  offer_id?: string | null;
  title?: string | null;
  discount_type?: string | null;
  discount_value?: number | null;
  discount_amount?: number | null;
  applies_to_description?: string | null;
  expires_on?: string | null;
  error_code?: string | null;
  message?: string | null;
};

export type OffersListQuery = {
  page?: number;
  limit?: number;
  status?: OfferStatusFilter | string;
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
    }
  | { screen: 'khata'; action: 'load'; values?: KhataListQuery }
  | { screen: 'khata'; action: 'loadHistory'; values?: KhataHistoryQuery }
  | { screen: 'khata'; action: 'exportExcel'; values?: KhataHistoryQuery }
  | {
      screen: 'khata-detail';
      action: 'load';
      values: { customerId: string };
    }
  | {
      screen: 'khata-detail';
      action: 'repay';
      values: {
        customerId: string;
        amount: number;
        payment_mode: RepayMode;
        note?: string;
        reference_number?: string;
        idempotencyKey?: string;
      };
    }
  | {
      screen: 'khata-detail';
      action: 'remind';
      values: {
        customerId: string;
        channel: RemindChannel;
        message_template: RemindTemplate;
      };
    }
  | { screen: 'offers'; action: 'load'; values?: OffersListQuery }
  | { screen: 'offers'; action: 'create'; values: OfferWrite }
  | {
      screen: 'offers';
      action: 'patch';
      values: { offerId: string } & OfferPatch;
    }
  | { screen: 'offers'; action: 'toggle'; values: { offerId: string } }
  | { screen: 'offers'; action: 'delete'; values: { offerId: string } }
  | { screen: 'offers'; action: 'validate'; values: OfferValidateQuery };

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
  kpi?: KhataKpi | OfferKpi | null;
  aging?: KhataAging | null;
  customers?: KhataCustomerRow[];
  khata?: KhataDetail | null;
  repayments?: KhataPaymentRow[];
  period_total_collected?: number | null;
  repayment?: KhataRepaymentResult | null;
  remind?: KhataRemindResult | null;
  offers?: OfferRow[];
  offer?: OfferRow | null;
  offerToggle?: OfferToggleResult | null;
  offerDelete?: OfferDeleteResult | null;
  offerValidate?: OfferValidateResult | null;
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
  canRemind?: boolean;
  canMutateOffers?: boolean;
  invoiceId?: string | null;
  customerId?: string | null;
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

export function isCustomerNotFound(code: unknown): boolean {
  return code === 'CUSTOMER_NOT_FOUND';
}

export function isStaffCannotRemind(code: unknown): boolean {
  return code === 'STAFF_CANNOT_REMIND';
}

export function isOfferNotFound(code: unknown): boolean {
  return code === 'OFFER_NOT_FOUND';
}

export function isPlanFeatureLocked(code: unknown): boolean {
  return code === 'PLAN_FEATURE_LOCKED' || code === 'MODULE_NOT_IN_PLAN';
}

export function billingLockCopy(): string {
  return 'Billing is not included in the current plan.';
}

export function khataLockCopy(): string {
  return 'Khata requires the Starter plan.';
}

export function offersLockCopy(): string {
  return 'Offers require the Growth plan.';
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

export const REPAY_MODES: RepayMode[] = ['CASH', 'UPI', 'CARD'];

export const REMIND_CHANNELS: RemindChannel[] = ['WHATSAPP', 'SMS'];

export const REMIND_TEMPLATES: RemindTemplate[] = ['POLITE', 'FIRM'];

export const DISCOUNT_TYPES: DiscountType[] = ['PERCENTAGE', 'FLAT_RS'];

export const OFFER_APPLIES_TO: OfferAppliesTo[] = [
  'ALL',
  'CATEGORY',
  'PRODUCT',
];

export const OFFER_STATUS_FILTERS: OfferStatusFilter[] = [
  'ACTIVE',
  'EXPIRED',
  'ALL',
];

export const INVOICE_TEMPLATES = ['MODERN', 'MINIMAL', 'THERMAL'] as const;

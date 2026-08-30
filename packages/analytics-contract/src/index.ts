export const ANALYTICS_SCREENS = ['analytics'] as const;

export type AnalyticsScreen = (typeof ANALYTICS_SCREENS)[number];

export const ANALYTICS_TABS = [
  'overview',
  'sales-register',
  'products',
  'gst',
  'reports',
] as const;

export type AnalyticsTab = (typeof ANALYTICS_TABS)[number];

export const ANALYTICS_PERIODS = ['7D', '30D', '12M', 'FY', 'CUSTOM'] as const;

export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

export const ANALYTICS_REPORT_IDS = [
  'GSTR-1-DRAFT',
  'GSTR-3B-DRAFT',
  'SALES-REGISTER',
  'PURCHASE-REG',
  'STOCK-SUMMARY',
  'DEAD-STOCK',
  'PARTY-LEDGER',
  'DAYBOOK',
  'PL-STATEMENT',
] as const;

export type AnalyticsReportId = (typeof ANALYTICS_REPORT_IDS)[number];

export type PharmacyRole = 'pharmacy_owner' | 'pharmacy_staff';

export type PlanCode = 'FREE' | 'STARTER' | 'RETAIL_PRO' | 'ENTERPRISE';

export type PageMeta = {
  page?: number;
  limit?: number;
  total?: number;
  has_next?: boolean;
  total_pages?: number;
};

/** Core EPIC-016 STORY-004 period query. `period` is required. */
export type AnalyticsQuery = {
  period?: AnalyticsPeriod | string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
  channel?: string;
  payment_method?: string;
  sort?: string;
  order?: string;
  dead_stock_only?: boolean;
};

export type OverviewFinancials = {
  net_revenue_paise?: number | null;
  gross_profit_paise?: number | null;
  margin_pct?: number | null;
  units_sold?: number | null;
  net_gst_paise?: number | null;
  cogs_data_incomplete?: boolean | null;
};

export type OverviewTopItem = {
  product_id?: string | null;
  name?: string | null;
  units_sold?: number | null;
  revenue_paise?: number | null;
};

export type ChannelMix = {
  online_pct?: number | null;
  counter_pct?: number | null;
};

export type PaymentMixRow = {
  method?: string | null;
  pct?: number | null;
};

/** GET /pharmacy/analytics/overview */
export type AnalyticsOverview = {
  pharmacy_id?: string | null;
  period?: string | null;
  date_from?: string | null;
  date_to?: string | null;
  financials?: OverviewFinancials | null;
  top_items?: OverviewTopItem[] | null;
  channel_mix?: ChannelMix | null;
  payment_mix?: PaymentMixRow[] | null;
};

export type SaleRegisterRow = {
  sale_id?: string | null;
  invoice_number?: string | null;
  sale_date?: string | null;
  channel?: string | null;
  customer_name?: string | null;
  items_count?: number | null;
  subtotal_paise?: number | null;
  gst_paise?: number | null;
  total_paise?: number | null;
  payment_method?: string | null;
  status?: string | null;
};

export type SaleRegisterTotals = {
  total_sales?: number | null;
  total_revenue_paise?: number | null;
  total_gst_paise?: number | null;
};

export type SalesRegisterData = {
  sales?: SaleRegisterRow[] | null;
  totals?: SaleRegisterTotals | null;
};

export type ProductAnalyticsRow = {
  product_id?: string | null;
  name?: string | null;
  category?: string | null;
  units_sold?: number | null;
  revenue_paise?: number | null;
  cogs_paise?: number | null;
  profit_paise?: number | null;
  margin_pct?: number | null;
  stock_remaining?: number | null;
  dead_stock_flag?: boolean | null;
  cogs_missing?: boolean | null;
};

export type ProductsAnalyticsData = {
  products?: ProductAnalyticsRow[] | null;
};

export type PlCard = {
  revenue_paise?: number | null;
  cogs_paise?: number | null;
  gross_profit_paise?: number | null;
  operating_expenses_paise?: number | null;
  net_gst_payable_paise?: number | null;
  net_profit_paise?: number | null;
};

export type GstSlabRow = {
  slab_pct?: number | null;
  taxable_value_paise?: number | null;
  output_gst_paise?: number | null;
  input_itc_paise?: number | null;
  net_paise?: number | null;
};

export type GstLiability = {
  output_gst_paise?: number | null;
  input_itc_paise?: number | null;
  net_payable_paise?: number | null;
  slab_breakdown?: GstSlabRow[] | null;
};

export type CashSummary = {
  total_collections_paise?: number | null;
  cash_collected_paise?: number | null;
  digital_collected_paise?: number | null;
};

export type PurchasesSummary = {
  total_purchases_paise?: number | null;
  gst_on_purchases_paise?: number | null;
};

export type DayBookRow = {
  date?: string | null;
  type?: string | null;
  reference?: string | null;
  description?: string | null;
  debit_paise?: number | null;
  credit_paise?: number | null;
  balance_paise?: number | null;
};

export type AccountsGstData = {
  pl_card?: PlCard | null;
  gst_liability?: GstLiability | null;
  cash_summary?: CashSummary | null;
  purchases_summary?: PurchasesSummary | null;
  day_book?: DayBookRow[] | null;
  data_warning?: boolean | null;
};

export type ReportCatalogueRow = {
  report_id?: string | null;
  name?: string | null;
  group?: string | null;
  is_favorite?: boolean | null;
};

export type AnalyticsReport = {
  report_id?: string | null;
  name?: string | null;
  period_from?: string | null;
  period_to?: string | null;
  columns?: string[] | null;
  rows?: unknown[][] | null;
  totals?: Record<string, unknown> | null;
  export_url?: string | null;
  export_async?: boolean | null;
  is_favorite?: boolean | null;
};

export type AnalyticsCommand =
  | {
      screen: 'analytics';
      action: 'loadOverview';
      values?: AnalyticsQuery;
    }
  | {
      screen: 'analytics';
      action: 'loadSalesRegister';
      values?: AnalyticsQuery;
    }
  | {
      screen: 'analytics';
      action: 'loadProducts';
      values?: AnalyticsQuery;
    }
  | {
      screen: 'analytics';
      action: 'loadGst';
      values?: AnalyticsQuery;
    }
  | {
      screen: 'analytics';
      action: 'loadCatalogue';
      values?: AnalyticsQuery;
    }
  | {
      screen: 'analytics';
      action: 'loadReport';
      values: AnalyticsQuery & { reportId: string };
    }
  | {
      screen: 'analytics';
      action: 'favorite';
      values: { reportId: string; is_favorite: boolean };
    };

export type AnalyticsSubmitSuccess = {
  ok: true;
  overview?: AnalyticsOverview | null;
  salesRegister?: SalesRegisterData | null;
  products?: ProductsAnalyticsData | null;
  gst?: AccountsGstData | null;
  reports?: ReportCatalogueRow[] | null;
  report?: AnalyticsReport | null;
  meta?: PageMeta;
};

export type AnalyticsSubmitFailure = {
  ok: false;
  fieldErrors?: Record<string, string>;
  formError?: string;
  code?: string;
};

export type AnalyticsSubmitResult =
  AnalyticsSubmitSuccess | AnalyticsSubmitFailure;

export type AnalyticsFeatureData = {
  screen: AnalyticsScreen;
  onSubmit: (command: AnalyticsCommand) => Promise<AnalyticsSubmitResult>;
  role?: PharmacyRole | null;
  plan?: PlanCode | null;
  analyticsLocked?: boolean;
  canViewGst?: boolean;
  canFavorite?: boolean;
  tokenScope?: 'full' | 'pos' | null;
  errors?: Record<string, string>;
  formError?: string;
  busy?: boolean;
  disabled?: boolean;
};

export function isAnalyticsScreen(value: unknown): value is AnalyticsScreen {
  return (
    typeof value === 'string' &&
    (ANALYTICS_SCREENS as readonly string[]).includes(value)
  );
}

export function isAnalyticsTab(value: unknown): value is AnalyticsTab {
  return (
    typeof value === 'string' &&
    (ANALYTICS_TABS as readonly string[]).includes(value)
  );
}

export function isAnalyticsPeriod(value: unknown): value is AnalyticsPeriod {
  return (
    typeof value === 'string' &&
    (ANALYTICS_PERIODS as readonly string[]).includes(value)
  );
}

export function isAnalyticsFeatureData(
  value: unknown,
): value is AnalyticsFeatureData {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const feature = value as Partial<AnalyticsFeatureData>;
  return (
    isAnalyticsScreen(feature.screen) && typeof feature.onSubmit === 'function'
  );
}

export function isPlanFeatureLocked(code: unknown): boolean {
  return (
    code === 'PLAN_FEATURE_LOCKED' ||
    code === 'MODULE_NOT_IN_PLAN' ||
    code === 'PLAN_UPGRADE_REQUIRED'
  );
}

export function analyticsLockCopy(): string {
  return 'Analytics requires the Growth plan.';
}

export function isReportNotFound(code: unknown): boolean {
  return code === 'REPORT_NOT_FOUND';
}

export function isForbidden(code: unknown): boolean {
  return code === 'FORBIDDEN' || code === 'INSUFFICIENT_PERMISSIONS';
}

export function isPosTokenRestricted(code: unknown): boolean {
  return code === 'POS_TOKEN_RESTRICTED';
}

export function normalizeReportId(value: string): string {
  return value.trim().toUpperCase();
}

export function isAnalyticsReportId(value: string): boolean {
  return (ANALYTICS_REPORT_IDS as readonly string[]).includes(
    normalizeReportId(value),
  );
}

export function formatPaise(value: unknown): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function formatPct(value: unknown): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }
  return `${value.toFixed(1)}%`;
}

export function isOverviewEmpty(
  overview: AnalyticsOverview | null | undefined,
): boolean {
  if (!overview) {
    return true;
  }
  const financials = overview.financials;
  const revenue = financials?.net_revenue_paise ?? 0;
  const units = financials?.units_sold ?? 0;
  const tops = overview.top_items ?? [];
  const mix = overview.payment_mix ?? [];
  return revenue === 0 && units === 0 && tops.length === 0 && mix.length === 0;
}

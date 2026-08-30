import type {
  AnalyticsFeatureData,
  AnalyticsSubmitResult,
} from '@medmate/analytics-contract';
import type { MfeDataEnvelope } from '@medmate/contracts';
import { createMfeEnvelope } from '@medmate/test-utils';

export function feature(
  onSubmit: AnalyticsFeatureData['onSubmit'] = async () => ({ ok: true }),
  extra: Partial<AnalyticsFeatureData> = {},
): AnalyticsFeatureData {
  return {
    screen: 'analytics',
    onSubmit,
    role: 'pharmacy_owner',
    plan: 'RETAIL_PRO',
    analyticsLocked: false,
    canViewGst: true,
    canFavorite: true,
    tokenScope: 'full',
    ...extra,
  };
}

export function data(
  next: AnalyticsFeatureData,
  extra: Partial<MfeDataEnvelope<AnalyticsFeatureData>> = {},
) {
  return {
    ...createMfeEnvelope({
      feature: next,
      context: { hostId: 'test-host', locale: 'en-IN', permissions: [] },
    }),
    ...extra,
  };
}

export const OVERVIEW_OK: AnalyticsSubmitResult = {
  ok: true,
  overview: {
    period: '30D',
    date_from: '2026-07-31',
    date_to: '2026-08-30',
    financials: {
      net_revenue_paise: 2840000,
      gross_profit_paise: 682000,
      margin_pct: 24,
      units_sold: 4120,
      net_gst_paise: 142000,
    },
    top_items: [
      {
        product_id: 'p-1',
        name: 'Metformin 500mg',
        units_sold: 412,
        revenue_paise: 82400,
      },
    ],
    channel_mix: { online_pct: 68.4, counter_pct: 31.6 },
    payment_mix: [{ method: 'UPI', pct: 54.2 }],
  },
};

export const SALES_OK: AnalyticsSubmitResult = {
  ok: true,
  salesRegister: {
    sales: [
      {
        sale_id: 's-1',
        invoice_number: 'INV-001',
        sale_date: '2026-08-24T10:30:00Z',
        channel: 'ONLINE',
        items_count: 3,
        total_paise: 50400,
        payment_method: 'UPI',
        status: 'DELIVERED',
      },
    ],
    totals: {
      total_sales: 1,
      total_revenue_paise: 50400,
      total_gst_paise: 2400,
    },
  },
  meta: { page: 1, limit: 20, total: 1, has_next: true },
};

export const PRODUCTS_OK: AnalyticsSubmitResult = {
  ok: true,
  products: {
    products: [
      {
        product_id: 'p-1',
        name: 'Metformin 500mg',
        units_sold: 412,
        revenue_paise: 82400,
        margin_pct: 25,
        stock_remaining: 840,
        dead_stock_flag: false,
      },
    ],
  },
  meta: { page: 1, limit: 20, total: 1, has_next: false },
};

export const GST_OK: AnalyticsSubmitResult = {
  ok: true,
  gst: {
    pl_card: {
      revenue_paise: 2840000,
      cogs_paise: 2158000,
      gross_profit_paise: 682000,
      net_profit_paise: 416000,
    },
    gst_liability: {
      output_gst_paise: 208000,
      slab_breakdown: [
        {
          slab_pct: 5,
          taxable_value_paise: 840000,
          output_gst_paise: 42000,
          input_itc_paise: 18000,
          net_paise: 24000,
        },
      ],
    },
    day_book: [
      {
        date: '2026-08-24',
        type: 'SALE',
        reference: 'INV-001',
        debit_paise: 0,
        credit_paise: 50400,
        balance_paise: 50400,
      },
    ],
  },
};

export const CATALOGUE_OK: AnalyticsSubmitResult = {
  ok: true,
  reports: [
    {
      report_id: 'DAYBOOK',
      name: 'Day Book',
      group: 'SUMMARY',
      is_favorite: false,
    },
    {
      report_id: 'GSTR-1-DRAFT',
      name: 'GSTR-1 Draft',
      group: 'GST',
      is_favorite: true,
    },
  ],
};

export const REPORT_OK: AnalyticsSubmitResult = {
  ok: true,
  report: {
    report_id: 'DAYBOOK',
    name: 'Day Book',
    period_from: '2026-08-01',
    period_to: '2026-08-30',
    columns: ['date', 'type', 'reference'],
    rows: [['2026-08-24', 'SALE', 'INV-001']],
    totals: { row_count: 1 },
  },
};

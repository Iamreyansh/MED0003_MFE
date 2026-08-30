import type { MfeDataEnvelope } from '@medmate/contracts';
import type {
  ProcurementFeatureData,
  ProcurementScreen,
  ProcurementSubmitResult,
} from '@medmate/procurement-contract';
import { createMfeEnvelope } from '@medmate/test-utils';

export function feature(
  screen: ProcurementScreen,
  onSubmit: ProcurementFeatureData['onSubmit'] = async () => ({ ok: true }),
  extra: Partial<ProcurementFeatureData> = {},
): ProcurementFeatureData {
  return {
    screen,
    onSubmit,
    role: 'pharmacy_owner',
    plan: 'RETAIL_PRO',
    canWrite: true,
    canStockIn: true,
    canAccessGrowth: true,
    canMutateDistributors: true,
    canPriceCompare: true,
    canRefreshReorder: true,
    canSendPo: true,
    grnId: screen === 'editor' ? 'grn-1' : null,
    ...extra,
  };
}

export function data(
  next: ProcurementFeatureData,
  extra: Partial<MfeDataEnvelope<ProcurementFeatureData>> = {},
) {
  return {
    ...createMfeEnvelope({
      feature: next,
      context: { hostId: 'test-host', locale: 'en-IN', permissions: [] },
    }),
    ...extra,
  };
}

export const GRN_LIST: ProcurementSubmitResult = {
  ok: true,
  kpi: {
    purchases_this_month: 2,
    input_gst_credit_this_month: 120,
    total_grns: 2,
  },
  grns: [
    {
      grn_id: 'grn-1',
      distributor_name: 'Medico Pharma',
      invoice_number: 'INV-1',
      status: 'DRAFT',
      total: 2912,
    },
  ],
  meta: { page: 1, has_next: true },
};

export const GRN_DETAIL: ProcurementSubmitResult = {
  ok: true,
  grn: {
    grn_id: 'grn-1',
    invoice_number: 'INV-1',
    status: 'DRAFT',
    distributor: { id: 'd1', firm_name: 'Medico Pharma' },
    items: [
      {
        item_id: 'item-1',
        product_id: 'prod-1',
        product_name: 'Crocin 500mg Tablet',
        batch_number: 'B1',
        quantity: 10,
        line_total: 291.2,
      },
    ],
    totals: { grand_total: 291.2 },
  },
};

export const DISTRIBUTOR_LIST: ProcurementSubmitResult = {
  ok: true,
  distributors: [
    {
      id: 'd1',
      firm_name: 'Medico Pharma',
      payment_terms_days: 30,
      credit_limit: 100000,
    },
  ],
  meta: { page: 1, has_next: false },
};

export const SUPPLY: ProcurementSubmitResult = {
  ok: true,
  supplyItems: [
    {
      product_id: 'prod-1',
      product_name: 'Crocin 500mg Tablet',
      effective_landed_cost: 11.82,
      is_preferred_source: false,
    },
  ],
};

export const COMPARE: ProcurementSubmitResult = {
  ok: true,
  compare: [
    {
      product_id: 'prod-1',
      product_name: 'Crocin 500mg Tablet',
      distributor_prices: [
        {
          distributor_id: 'd1',
          distributor_name: 'Medico Pharma',
          effective_landed_cost: 11.82,
          price_rank: 1,
        },
      ],
    },
  ],
};

export const REORDER_LIST: ProcurementSubmitResult = {
  ok: true,
  suggestionGroups: [
    {
      key: 'd1',
      distributor_id: 'd1',
      distributor_name: 'Medico Pharma',
      label: 'Medico Pharma',
      items: [
        {
          product_id: 'prod-1',
          product_name: 'Crocin 500mg Tablet',
          quantity: 20,
        },
      ],
    },
  ],
  meta: { page: 1, has_next: false },
};

export const PO_LIST: ProcurementSubmitResult = {
  ok: true,
  purchaseOrders: [
    {
      po_id: 'po-1',
      po_number: 'PO-2026-08-000001',
      distributor_name: 'Medico Pharma',
      status: 'DRAFT',
      estimated_total: 2364,
    },
  ],
};

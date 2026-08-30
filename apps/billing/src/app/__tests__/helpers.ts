import type {
  BillingFeatureData,
  BillingScreen,
  BillingSubmitResult,
} from '@medmate/billing-contract';
import type { MfeDataEnvelope } from '@medmate/contracts';
import { createMfeEnvelope } from '@medmate/test-utils';

export function feature(
  screen: BillingScreen,
  onSubmit: BillingFeatureData['onSubmit'] = async () => ({ ok: true }),
  extra: Partial<BillingFeatureData> = {},
): BillingFeatureData {
  return {
    screen,
    onSubmit,
    role: 'pharmacy_owner',
    plan: 'FREE',
    canPatchSettings: true,
    canMarkPaid: true,
    canRemind: true,
    canMutateOffers: true,
    invoiceId: screen === 'invoice-detail' ? 'inv-1' : null,
    customerId: screen === 'khata-detail' ? 'cust-1' : null,
    ...extra,
  };
}

export function data(
  next: BillingFeatureData,
  extra: Partial<MfeDataEnvelope<BillingFeatureData>> = {},
) {
  return {
    ...createMfeEnvelope({
      feature: next,
      context: { hostId: 'test-host', locale: 'en-IN', permissions: [] },
    }),
    ...extra,
  };
}

export const INVOICE_LIST: BillingSubmitResult = {
  ok: true,
  invoices: [
    {
      invoice_id: 'inv-1',
      invoice_number: 'INV-1',
      date: '2026-08-30',
      customer_name: 'Ravi',
      payment_status: 'PAID',
      grand_total: 291.2,
    },
  ],
  meta: { page: 1, has_next: true },
};

export const INVOICE_DETAIL: BillingSubmitResult = {
  ok: true,
  invoice: {
    invoice_id: 'inv-1',
    invoice_number: 'INV-1',
    payment_status: 'PAID',
    grand_total: 291.2,
    customer: { name: 'Ravi' },
    line_items: [
      {
        product_name: 'Crocin 500mg Tablet',
        batch_number: 'B1',
        quantity: 2,
        gst_amount: 44.2,
        line_total: 291.2,
      },
    ],
    gst_breakdown: [
      { slab: '12%', taxable_amount: 247, cgst: 22.1, sgst: 22.1 },
    ],
  },
};

export const SETTINGS: BillingSubmitResult = {
  ok: true,
  settings: {
    template: 'MODERN',
    invoice_prefix: 'INV',
    document_title: 'Tax Invoice',
    accent_color: '#114E4E',
    bank_details: { bank_name: 'SBI', ifsc_code: 'SBIN0001234' },
  },
};

export const SALES_LIST: BillingSubmitResult = {
  ok: true,
  sales: [
    {
      sale_id: 'inv-1',
      invoice_number: 'INV-1',
      date: '2026-08-30',
      customer_name: 'Ravi',
      payment_status: 'PENDING',
      grand_total: 291.2,
    },
  ],
  meta: { page: 1, has_next: false },
};

export const SALES_SUMMARY: BillingSubmitResult = {
  ok: true,
  summary: {
    total_bills: 1,
    total_revenue: 291.2,
    avg_bill_value: 291.2,
  },
};

export const KHATA_LIST: BillingSubmitResult = {
  ok: true,
  kpi: {
    total_outstanding: 8500,
    overdue_30d: 3000,
    collected_this_month: 48000,
    collection_rate_pct: 74.5,
  },
  aging: {
    current_0_30d: 5500,
    overdue_31_60d: 2000,
    overdue_60d_plus: 1000,
  },
  customers: [
    {
      customer_id: 'cust-1',
      name: 'Ramesh Gupta',
      phone: '+919876543001',
      outstanding: 8500,
      is_overdue: true,
      days_overdue: 39,
    },
  ],
  meta: { page: 1, has_next: false },
};

export const KHATA_HISTORY: BillingSubmitResult = {
  ok: true,
  repayments: [
    {
      receipt_id: 'rcpt-1',
      receipt_number: 'RCPT-2026-07-000013',
      date: '2026-07-24',
      customer_name: 'Ramesh Gupta',
      mode: 'CASH',
      amount: 5000,
    },
  ],
  period_total_collected: 5000,
  meta: { page: 1, has_next: false },
};

export const KHATA_DETAIL: BillingSubmitResult = {
  ok: true,
  khata: {
    customer: {
      customer_id: 'cust-1',
      name: 'Ramesh Gupta',
      phone: '+919876543001',
      credit_limit: 50000,
    },
    summary: {
      total_outstanding: 8500,
      overdue_amount: 3000,
      credit_utilisation_pct: 17,
    },
    unpaid_bills: [
      {
        invoice_id: 'inv-1',
        invoice_number: 'INV-1',
        invoice_date: '2026-06-15',
        amount: 3000,
        days_since: 39,
      },
    ],
    ledger: [
      {
        entry_id: 'e1',
        type: 'DEBIT',
        date: '2026-07-10',
        reference: 'INV-1',
        amount: 5500,
        running_balance: 8500,
      },
    ],
    total_outstanding: 8500,
  },
};

export const OFFERS_LIST: BillingSubmitResult = {
  ok: true,
  kpi: { active_count: 1, total_redemptions: 4 },
  offers: [
    {
      offer_id: 'off-1',
      title: '10% Off Antibiotics',
      coupon_code: 'AB12CD',
      discount_type: 'PERCENTAGE',
      discount_value: 10,
      applies_to: 'ALL',
      valid_from: '2026-07-01',
      valid_until: '2026-07-31',
      is_active: true,
    },
  ],
  meta: { page: 1, has_next: false },
};

export const SALE_DETAIL: BillingSubmitResult = {
  ok: true,
  sale: {
    invoice_id: 'inv-1',
    sale_id: 'inv-1',
    invoice_number: 'INV-1',
    grand_total: 291.2,
    payment_status: 'PENDING',
  },
};

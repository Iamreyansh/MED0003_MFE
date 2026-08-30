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
    invoiceId: screen === 'invoice-detail' ? 'inv-1' : null,
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

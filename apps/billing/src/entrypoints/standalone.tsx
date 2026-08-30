/**
 * Standalone harness — shared mfe-kit bootstrap only.
 */
import {
  BILLING_SCREENS,
  isBillingScreen,
  type BillingCommand,
  type BillingFeatureData,
  type BillingScreen,
  type BillingSubmitResult,
} from '@medmate/billing-contract';
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { mountStandalone, StandaloneShell } from '@medmate/mfe-kit';
import { Button, Inline, StatusMessage } from '@medmate/ui';
import { useMemo, useState } from 'react';
import BillingMfe from '../app/BillingMfe';
import type { BillingMfeProps } from '../contract';
import '@medmate/ui/styles.css';

function readScreen(): BillingScreen {
  if (typeof window === 'undefined') {
    return 'invoices';
  }
  const value = new URLSearchParams(window.location.search).get('screen');
  return isBillingScreen(value) ? value : 'invoices';
}

function mockSubmit(command: BillingCommand): BillingSubmitResult {
  if (command.screen === 'invoices' && command.action === 'load') {
    return {
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
      meta: { page: 1, has_next: false },
    };
  }
  if (command.screen === 'invoice-detail' && command.action === 'load') {
    if (command.values.invoiceId === 'missing') {
      return { ok: false, code: 'INVOICE_NOT_FOUND' };
    }
    return {
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
  }
  if (command.screen === 'invoice-settings' && command.action === 'load') {
    return {
      ok: true,
      settings: {
        template: 'MODERN',
        invoice_prefix: 'INV',
        document_title: 'Tax Invoice',
      },
    };
  }
  if (command.screen === 'sales' && command.action === 'load') {
    return {
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
  }
  if (command.screen === 'sales' && command.action === 'loadSummary') {
    return {
      ok: true,
      summary: { total_bills: 1, total_revenue: 291.2, avg_bill_value: 291.2 },
    };
  }
  if (command.screen === 'sales' && command.action === 'loadSale') {
    return {
      ok: true,
      sale: {
        invoice_id: 'inv-1',
        sale_id: 'inv-1',
        invoice_number: 'INV-1',
        grand_total: 291.2,
        payment_status: 'PENDING',
      },
    };
  }
  if (command.screen === 'khata' && command.action === 'load') {
    return {
      ok: true,
      kpi: { total_outstanding: 8500, overdue_30d: 3000 },
      aging: {
        current_0_30d: 5500,
        overdue_31_60d: 2000,
        overdue_60d_plus: 1000,
      },
      customers: [
        {
          customer_id: 'cust-1',
          name: 'Ramesh Gupta',
          outstanding: 8500,
          is_overdue: true,
        },
      ],
      meta: { page: 1, has_next: false },
    };
  }
  if (command.screen === 'khata' && command.action === 'loadHistory') {
    return {
      ok: true,
      repayments: [
        {
          receipt_id: 'rcpt-1',
          receipt_number: 'RCPT-1',
          date: '2026-07-24',
          customer_name: 'Ramesh Gupta',
          mode: 'CASH',
          amount: 5000,
        },
      ],
      meta: { page: 1 },
    };
  }
  if (command.screen === 'khata-detail' && command.action === 'load') {
    return {
      ok: true,
      khata: {
        customer: {
          customer_id: 'cust-1',
          name: 'Ramesh Gupta',
          credit_limit: 50000,
        },
        summary: { total_outstanding: 8500, overdue_amount: 3000 },
        unpaid_bills: [
          {
            invoice_id: 'inv-1',
            invoice_number: 'INV-1',
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
  }
  if (command.screen === 'offers' && command.action === 'load') {
    return {
      ok: true,
      kpi: { active_count: 1, total_redemptions: 4 },
      offers: [
        {
          offer_id: 'off-1',
          title: '10% Off Antibiotics',
          coupon_code: 'AB12CD',
          discount_type: 'PERCENTAGE',
          discount_value: 10,
          valid_from: '2026-07-01',
          valid_until: '2026-07-31',
          is_active: true,
        },
      ],
      meta: { page: 1 },
    };
  }
  if (command.screen === 'offers' && command.action === 'validate') {
    return {
      ok: true,
      offerValidate: { is_valid: true, discount_amount: 42 },
    };
  }
  return { ok: true };
}

function StandaloneHarness() {
  const [screen, setScreen] = useState<BillingScreen>(readScreen);
  const [log, setLog] = useState('Ready');

  const feature = useMemo<BillingFeatureData>(
    () => ({
      screen,
      role: 'pharmacy_owner',
      plan: 'FREE',
      canPatchSettings: true,
      canMarkPaid: true,
      canRemind: true,
      canMutateOffers: true,
      invoiceId: screen === 'invoice-detail' ? 'inv-1' : null,
      customerId: screen === 'khata-detail' ? 'cust-1' : null,
      onSubmit: async (command) => {
        setLog((current) => `${current} ${command.screen}:${command.action}`);
        return mockSubmit(command);
      },
    }),
    [screen],
  );

  const data = useMemo<BillingMfeProps['data']>(
    () => ({
      contractVersion: MFE_CONTRACT_VERSION,
      context: {
        hostId: 'billing-standalone',
        locale: 'en-IN',
        permissions: [],
      },
      feature,
      capabilities: {
        navigate: (path) => setLog(`navigate:${path}`),
        api: {
          request: async <T = unknown,>() => ({
            ok: true,
            status: 200,
            data: {} as T,
          }),
        },
      },
    }),
    [feature],
  );

  return (
    <StandaloneShell
      title="Billing standalone harness"
      description="Preview invoices, sales, khata, and offers."
      className="max-w-5xl"
    >
      <Inline wrap className="mb-4">
        {BILLING_SCREENS.map((type) => (
          <Button
            key={type}
            type="button"
            variant={type === screen ? 'primary' : 'ghost'}
            onClick={() => setScreen(type)}
          >
            {type}
          </Button>
        ))}
      </Inline>
      <BillingMfe data={data} />
      <StatusMessage>{log}</StatusMessage>
    </StandaloneShell>
  );
}

mountStandalone(<StandaloneHarness />);

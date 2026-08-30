/**
 * Standalone harness — shared mfe-kit bootstrap only.
 */
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { mountStandalone, StandaloneShell } from '@medmate/mfe-kit';
import {
  PROCUREMENT_SCREENS,
  isProcurementScreen,
  type PlanCode,
  type ProcurementCommand,
  type ProcurementFeatureData,
  type ProcurementScreen,
  type ProcurementSubmitResult,
} from '@medmate/procurement-contract';
import { Button, Inline, StatusMessage } from '@medmate/ui';
import { useMemo, useState } from 'react';
import ProcurementMfe from '../app/ProcurementMfe';
import type { ProcurementMfeProps } from '../contract';
import '@medmate/ui/styles.css';

function readScreen(): ProcurementScreen {
  if (typeof window === 'undefined') {
    return 'purchases';
  }
  const value = new URLSearchParams(window.location.search).get('screen');
  return isProcurementScreen(value) ? value : 'purchases';
}

function mockSubmit(command: ProcurementCommand): ProcurementSubmitResult {
  if (command.screen === 'purchases' && command.action === 'load') {
    return {
      ok: true,
      kpi: {
        purchases_this_month: 1,
        input_gst_credit_this_month: 120,
        total_grns: 1,
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
      meta: { page: 1, has_next: false },
    };
  }
  if (command.screen === 'purchases' && command.action === 'create') {
    return { ok: true, grn: { grn_id: 'grn-2', status: 'DRAFT' } };
  }
  if (command.screen === 'purchases' && command.action === 'importCsv') {
    return {
      ok: true,
      importPreview: {
        grn_id: 'grn-csv',
        unmatched_items: [
          { row_number: 12, raw_data: { product_name: 'Unknown Med' } },
        ],
      },
    };
  }
  if (command.screen === 'editor' && command.action === 'load') {
    if (command.values.grn_id === 'missing') {
      return { ok: false, code: 'GRN_NOT_FOUND' };
    }
    return {
      ok: true,
      grn: {
        grn_id: 'grn-1',
        invoice_number: 'INV-1',
        status: 'DRAFT',
        distributor: { firm_name: 'Medico Pharma' },
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
  }
  if (command.screen === 'distributors' && command.action === 'load') {
    return {
      ok: true,
      distributors: [
        {
          id: 'd1',
          firm_name: 'Medico Pharma',
          payment_terms_days: 30,
          credit_limit: 100000,
        },
      ],
    };
  }
  if (
    command.screen === 'distributors' &&
    command.action === 'loadPriceCompare'
  ) {
    return {
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
  }
  if (command.screen === 'reorder' && command.action === 'load') {
    return {
      ok: true,
      suggestionGroups: [
        {
          key: 'd1',
          distributor_id: 'd1',
          label: 'Medico Pharma',
          items: [
            { product_id: 'prod-1', product_name: 'Crocin', quantity: 20 },
          ],
        },
      ],
    };
  }
  if (command.screen === 'reorder' && command.action === 'loadPurchaseOrders') {
    return {
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
  }
  if (command.screen === 'reorder' && command.action === 'createPo') {
    return {
      ok: true,
      purchaseOrder: {
        po_id: 'po-2',
        po_number: 'PO-2026-08-000002',
        status: 'DRAFT',
        items_count: 1,
        estimated_total: 2364,
      },
    };
  }
  return { ok: true };
}

function StandaloneHarness() {
  const [screen, setScreen] = useState<ProcurementScreen>(readScreen);
  const [plan, setPlan] = useState<PlanCode>('RETAIL_PRO');
  const [log, setLog] = useState('Ready');

  const feature = useMemo<ProcurementFeatureData>(
    () => ({
      screen,
      role: 'pharmacy_owner',
      plan,
      canWrite: true,
      canStockIn: true,
      canAccessGrowth: plan !== 'FREE',
      canMutateDistributors: plan !== 'FREE',
      canPriceCompare: plan !== 'FREE',
      canRefreshReorder: plan !== 'FREE',
      canSendPo: plan !== 'FREE',
      grnId: screen === 'editor' ? 'grn-1' : null,
      onSubmit: async (command) => {
        setLog((current) => `${current} ${command.screen}:${command.action}`);
        return mockSubmit(command);
      },
    }),
    [plan, screen],
  );

  const data = useMemo<ProcurementMfeProps['data']>(
    () => ({
      contractVersion: MFE_CONTRACT_VERSION,
      context: {
        hostId: 'procurement-standalone',
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
      title="Procurement standalone harness"
      description="Preview purchases, GRN editor, distributors, and reorder."
      className="max-w-5xl"
    >
      <Inline wrap className="mb-4">
        {PROCUREMENT_SCREENS.map((type) => (
          <Button
            key={type}
            type="button"
            variant={type === screen ? 'primary' : 'ghost'}
            onClick={() => setScreen(type)}
          >
            {type}
          </Button>
        ))}
        <Button
          type="button"
          variant={plan === 'FREE' ? 'primary' : 'ghost'}
          onClick={() => setPlan('FREE')}
        >
          Use Free plan
        </Button>
      </Inline>
      <ProcurementMfe data={data} />
      <StatusMessage>{log}</StatusMessage>
    </StandaloneShell>
  );
}

mountStandalone(<StandaloneHarness />);

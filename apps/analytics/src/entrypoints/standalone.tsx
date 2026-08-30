/**
 * Standalone harness — shared mfe-kit bootstrap only.
 */
import type {
  AnalyticsCommand,
  AnalyticsFeatureData,
  AnalyticsSubmitResult,
} from '@medmate/analytics-contract';
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { mountStandalone, StandaloneShell } from '@medmate/mfe-kit';
import { StatusMessage } from '@medmate/ui';
import { useMemo, useState } from 'react';
import AnalyticsMfe from '../app/AnalyticsMfe';
import type { AnalyticsMfeProps } from '../contract';
import '@medmate/ui/styles.css';

function mockSubmit(command: AnalyticsCommand): AnalyticsSubmitResult {
  if (command.action === 'loadOverview') {
    return {
      ok: true,
      overview: {
        period: command.values?.period ?? '30D',
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
  }
  if (command.action === 'loadSalesRegister') {
    return {
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
        totals: { total_sales: 1, total_revenue_paise: 50400 },
      },
      meta: { page: 1, has_next: false },
    };
  }
  if (command.action === 'loadProducts') {
    return {
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
      meta: { page: 1 },
    };
  }
  if (command.action === 'loadGst') {
    return {
      ok: true,
      gst: {
        pl_card: {
          revenue_paise: 2840000,
          cogs_paise: 2158000,
          gross_profit_paise: 682000,
          net_profit_paise: 416000,
        },
        gst_liability: {
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
        day_book: [],
      },
    };
  }
  if (command.action === 'loadCatalogue') {
    return {
      ok: true,
      reports: [
        {
          report_id: 'DAYBOOK',
          name: 'Day Book',
          group: 'SUMMARY',
          is_favorite: false,
        },
      ],
    };
  }
  if (command.action === 'loadReport') {
    if (command.values.reportId === 'MISSING') {
      return { ok: false, code: 'REPORT_NOT_FOUND' };
    }
    return {
      ok: true,
      report: {
        report_id: command.values.reportId,
        name: 'Day Book',
        period_from: '2026-08-01',
        period_to: '2026-08-30',
        columns: ['date', 'type'],
        rows: [['2026-08-24', 'SALE']],
      },
    };
  }
  if (command.action === 'favorite') {
    return {
      ok: true,
      report: {
        report_id: command.values.reportId,
        is_favorite: command.values.is_favorite,
      },
    };
  }
  return { ok: true };
}

function StandaloneHarness() {
  const [log, setLog] = useState('Ready');

  const feature = useMemo<AnalyticsFeatureData>(
    () => ({
      screen: 'analytics',
      role: 'pharmacy_owner',
      plan: 'RETAIL_PRO',
      analyticsLocked: false,
      canViewGst: true,
      canFavorite: true,
      tokenScope: 'full',
      onSubmit: async (command) => {
        setLog((current) => `${current} ${command.action}`);
        return mockSubmit(command);
      },
    }),
    [],
  );

  const data = useMemo<AnalyticsMfeProps['data']>(
    () => ({
      contractVersion: MFE_CONTRACT_VERSION,
      context: {
        hostId: 'analytics-standalone',
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
      title="Analytics standalone harness"
      description="Preview Growth analytics tabs, GST, and favorites."
      className="max-w-5xl"
    >
      <AnalyticsMfe data={data} />
      <StatusMessage>{log}</StatusMessage>
    </StandaloneShell>
  );
}

mountStandalone(<StandaloneHarness />);

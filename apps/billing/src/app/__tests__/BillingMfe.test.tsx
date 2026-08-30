import type { BillingScreen } from '@medmate/billing-contract';
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BillingLayout } from '../../layouts/BillingLayout';
import BillingMfe from '../BillingMfe';
import {
  INVOICE_DETAIL,
  INVOICE_LIST,
  SALES_LIST,
  SALES_SUMMARY,
  SETTINGS,
  data,
  feature,
} from './helpers';

afterEach(() => {
  cleanup();
});

describe('BillingMfe', () => {
  it('shows a contract error without a screen', () => {
    render(
      <BillingMfe
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: { title: 'x' } as never,
        }}
      />,
    );
    expect(screen.getByTestId('billing-contract-error')).toBeTruthy();
  });
});

describe('BillingLayout', () => {
  it('renders unknown screens', () => {
    render(
      <BillingLayout
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: {
            screen: 'nope' as BillingScreen,
            onSubmit: async () => ({ ok: true }),
          },
        }}
      />,
    );
    expect(screen.getByText('Unknown billing screen.')).toBeTruthy();
  });

  it('routes invoices, detail, settings, and sales', async () => {
    const { rerender } = render(
      <BillingMfe data={data(feature('invoices', async () => INVOICE_LIST))} />,
    );
    expect(await screen.findByTestId('billing-invoices-page')).toBeTruthy();
    rerender(
      <BillingMfe
        data={data(feature('invoice-detail', async () => INVOICE_DETAIL))}
      />,
    );
    expect(
      await screen.findByTestId('billing-invoice-detail-page'),
    ).toBeTruthy();
    rerender(
      <BillingMfe
        data={data(feature('invoice-settings', async () => SETTINGS))}
      />,
    );
    expect(
      await screen.findByTestId('billing-invoice-settings-page'),
    ).toBeTruthy();
    rerender(
      <BillingMfe
        data={data(
          feature('sales', async (command) =>
            command.action === 'loadSummary' ? SALES_SUMMARY : SALES_LIST,
          ),
        )}
      />,
    );
    expect(await screen.findByTestId('billing-sales-page')).toBeTruthy();
  });
});

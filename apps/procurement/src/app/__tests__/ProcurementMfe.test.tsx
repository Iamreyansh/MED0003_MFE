import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import type { ProcurementScreen } from '@medmate/procurement-contract';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ProcurementLayout } from '../../layouts/ProcurementLayout';
import ProcurementMfe from '../ProcurementMfe';
import {
  DISTRIBUTOR_LIST,
  GRN_DETAIL,
  GRN_LIST,
  REORDER_LIST,
  data,
  feature,
} from './helpers';

afterEach(() => {
  cleanup();
});

describe('ProcurementMfe', () => {
  it('shows a contract error without a screen', () => {
    render(
      <ProcurementMfe
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: { title: 'x' } as never,
        }}
      />,
    );
    expect(screen.getByTestId('procurement-contract-error')).toBeTruthy();
  });
});

describe('ProcurementLayout', () => {
  it('renders unknown screens', () => {
    render(
      <ProcurementLayout
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: {
            screen: 'nope' as ProcurementScreen,
            onSubmit: async () => ({ ok: true }),
          },
        }}
      />,
    );
    expect(screen.getByText('Unknown procurement screen.')).toBeTruthy();
  });

  it('routes purchases, editor, and distributors layouts', async () => {
    const { rerender } = render(
      <ProcurementMfe
        data={data(feature('purchases', async () => GRN_LIST))}
      />,
    );
    expect(
      await screen.findByTestId('procurement-purchases-page'),
    ).toBeTruthy();
    rerender(
      <ProcurementMfe data={data(feature('editor', async () => GRN_DETAIL))} />,
    );
    expect(await screen.findByTestId('procurement-editor-page')).toBeTruthy();
    rerender(
      <ProcurementMfe
        data={data(
          feature('distributors', async () => DISTRIBUTOR_LIST),
          {
            capabilities: {},
          },
        )}
      />,
    );
    expect(
      await screen.findByTestId('procurement-distributors-page'),
    ).toBeTruthy();
    rerender(
      <ProcurementMfe
        data={data(feature('reorder', async () => REORDER_LIST))}
      />,
    );
    expect(await screen.findByTestId('procurement-reorder-page')).toBeTruthy();
  });
});

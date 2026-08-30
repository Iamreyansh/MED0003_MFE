import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import type { FinanceScreen } from '@medmate/finance-contract';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FinanceLayout } from '../../layouts/FinanceLayout';
import FinanceMfe from '../FinanceMfe';
import { SETTLEMENT_LIST, data, feature } from './helpers';

afterEach(() => {
  cleanup();
});

describe('FinanceMfe', () => {
  it('shows a contract error without a screen', () => {
    render(
      <FinanceMfe
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: { title: 'x' } as never,
        }}
      />,
    );
    expect(screen.getByTestId('finance-contract-error')).toBeTruthy();
  });
});

describe('FinanceLayout', () => {
  it('renders unknown screens', () => {
    render(
      <FinanceLayout
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: {
            screen: 'nope' as FinanceScreen,
            onSubmit: async () => ({ ok: true }),
          },
        }}
      />,
    );
    expect(screen.getByText('Unknown finance screen.')).toBeTruthy();
  });

  it('routes list and detail', async () => {
    const { rerender } = render(
      <FinanceMfe
        data={data(feature('settlements', async () => SETTLEMENT_LIST))}
      />,
    );
    expect(await screen.findByTestId('finance-settlements-page')).toBeTruthy();
    rerender(<FinanceMfe data={data(feature('settlement-detail'))} />);
    expect(screen.getByTestId('finance-settlement-detail-page')).toBeTruthy();
  });
});

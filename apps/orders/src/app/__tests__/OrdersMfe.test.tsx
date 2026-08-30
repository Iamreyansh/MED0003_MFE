import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import type { OrdersScreen } from '@medmate/orders-contract';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { OrdersLayout } from '../../layouts/OrdersLayout';
import OrdersMfe from '../OrdersMfe';
import { QUOTE_LIST, data, feature } from './helpers';

afterEach(() => {
  cleanup();
});

describe('OrdersMfe', () => {
  it('shows a contract error without a screen', () => {
    render(
      <OrdersMfe
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: { title: 'x' } as never,
        }}
      />,
    );
    expect(screen.getByTestId('orders-contract-error')).toBeTruthy();
  });
});

describe('OrdersLayout', () => {
  it('renders unknown screens', () => {
    render(
      <OrdersLayout
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: {
            screen: 'nope' as OrdersScreen,
            onSubmit: async () => ({ ok: true }),
          },
        }}
      />,
    );
    expect(screen.getByText('Unknown orders screen.')).toBeTruthy();
  });

  it('routes quotes, home, and actions', async () => {
    const { rerender } = render(
      <OrdersMfe data={data(feature('rx-quotes', async () => QUOTE_LIST))} />,
    );
    expect(await screen.findByTestId('orders-rx-quotes-page')).toBeTruthy();
    rerender(<OrdersMfe data={data(feature('orders-home'))} />);
    expect(screen.getByTestId('orders-orders-home-page')).toBeTruthy();
    rerender(<OrdersMfe data={data(feature('order-actions'))} />);
    expect(screen.getByTestId('orders-order-actions-page')).toBeTruthy();
  });
});

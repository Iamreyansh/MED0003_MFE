import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import type { SubscriptionScreen } from '@medmate/subscription-contract';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SubscriptionLayout } from '../../layouts/SubscriptionLayout';
import SubscriptionMfe from '../SubscriptionMfe';
import { data, feature } from './helpers';

afterEach(() => {
  cleanup();
});

describe('SubscriptionMfe', () => {
  it('shows a contract error without a screen', () => {
    render(
      <SubscriptionMfe
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: { title: 'x' } as never,
        }}
      />,
    );
    expect(screen.getByTestId('subscription-contract-error')).toBeTruthy();
  });
});

describe('SubscriptionLayout', () => {
  it('renders unknown screens', () => {
    render(
      <SubscriptionLayout
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: {
            screen: 'nope' as SubscriptionScreen,
            onSubmit: async () => ({ ok: true }),
          },
        }}
      />,
    );
    expect(screen.getByText('Unknown subscription screen.')).toBeTruthy();
  });

  it('routes plans and billing layouts', () => {
    const { rerender } = render(
      <SubscriptionMfe
        data={data(feature('plans', async () => ({ ok: true, plans: [] })))}
      />,
    );
    expect(screen.getByTestId('subscription-plans-page')).toBeTruthy();
    rerender(
      <SubscriptionMfe
        data={data(
          feature('billing', async () => ({ ok: true, invoices: [] })),
        )}
      />,
    );
    expect(screen.getByTestId('subscription-billing-page')).toBeTruthy();
  });
});

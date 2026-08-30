import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import type { PosScreen } from '@medmate/pos-contract';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PosLayout } from '../../layouts/PosLayout';
import PosMfe from '../PosMfe';
import { CART_RESULT, data, feature } from './helpers';

afterEach(() => {
  cleanup();
});

describe('PosMfe', () => {
  it('shows a contract error without a screen', () => {
    render(
      <PosMfe
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: { title: 'x' } as never,
        }}
      />,
    );
    expect(screen.getByTestId('pos-contract-error')).toBeTruthy();
  });
});

describe('PosLayout', () => {
  it('renders unknown screens', () => {
    render(
      <PosLayout
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: {
            screen: 'nope' as PosScreen,
            onSubmit: async () => ({ ok: true }),
          },
        }}
      />,
    );
    expect(screen.getByText('Unknown POS screen.')).toBeTruthy();
  });

  it('renders the counter layout', async () => {
    render(<PosMfe data={data(feature(async () => CART_RESULT))} />);
    expect(await screen.findByTestId('pos-counter-page')).toBeTruthy();
  });
});

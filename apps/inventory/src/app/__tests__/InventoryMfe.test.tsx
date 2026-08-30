import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import type { InventoryScreen } from '@medmate/inventory-contract';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { InventoryLayout } from '../../layouts/InventoryLayout';
import InventoryMfe from '../InventoryMfe';
import { ALERTS, LIST_ROWS, RACKS, SUMMARY, data, feature } from './helpers';

afterEach(() => {
  cleanup();
});

describe('InventoryMfe', () => {
  it('shows a contract error without a screen', () => {
    render(
      <InventoryMfe
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: { title: 'x' } as never,
        }}
      />,
    );
    expect(screen.getByTestId('inventory-contract-error')).toBeTruthy();
  });
});

describe('InventoryLayout', () => {
  it('renders unknown screens', () => {
    render(
      <InventoryLayout
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: {
            screen: 'nope' as InventoryScreen,
            onSubmit: async () => ({ ok: true }),
          },
        }}
      />,
    );
    expect(screen.getByText('Unknown inventory screen.')).toBeTruthy();
  });

  it('routes list, expiry, and racks layouts', async () => {
    const { rerender } = render(
      <InventoryMfe
        data={data(
          feature('list', async (command) =>
            command.action === 'loadSummary' ? SUMMARY : LIST_ROWS,
          ),
        )}
      />,
    );
    expect(await screen.findByTestId('inventory-list-page')).toBeTruthy();
    rerender(
      <InventoryMfe data={data(feature('expiry', async () => ALERTS))} />,
    );
    expect(await screen.findByTestId('inventory-expiry-page')).toBeTruthy();
    rerender(<InventoryMfe data={data(feature('racks', async () => RACKS))} />);
    expect(await screen.findByTestId('inventory-racks-page')).toBeTruthy();
  });
});

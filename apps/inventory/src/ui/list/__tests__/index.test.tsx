import type {
  InventoryCommand,
  InventorySubmitResult,
} from '@medmate/inventory-contract';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  LIST_ROWS,
  SUMMARY,
  data,
  feature,
} from '../../../app/__tests__/helpers';
import InventoryMfe from '../../../app/InventoryMfe';

afterEach(() => {
  cleanup();
});

function listSubmit(
  overrides: Partial<
    Record<InventoryCommand['action'], () => Promise<InventorySubmitResult>>
  > = {},
) {
  return vi.fn(
    async (command: InventoryCommand): Promise<InventorySubmitResult> => {
      const override = overrides[command.action];
      if (override) {
        return override();
      }
      if (command.action === 'loadSummary') {
        return SUMMARY;
      }
      if (command.action === 'load') {
        return LIST_ROWS;
      }
      return { ok: true, downloaded: true };
    },
  );
}

describe('ListScreen', () => {
  it('paginates, exports, and opens product detail', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const onSubmit = listSubmit();
    render(
      <InventoryMfe
        data={data(feature('list', onSubmit), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    expect(await screen.findByTestId('inventory-table')).toBeTruthy();
    expect(screen.getByTestId('summary-total-products')).toHaveTextContent(
      '12',
    );
    expect(screen.getByRole('heading', { name: 'Stock on hand' })).toBeTruthy();
    await user.click(
      screen.getByRole('button', { name: 'View near-expiry batches' }),
    );
    expect(onNavigate).toHaveBeenCalledWith('/inventory/expiry');
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(onNavigate).toHaveBeenCalledWith('/inventory/prod-1');
    await user.click(screen.getByRole('button', { name: 'Expiry watch' }));
    expect(onNavigate).toHaveBeenCalledWith('/inventory/expiry');
    await user.click(screen.getByRole('button', { name: 'Export Excel' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'export'),
      ).toBe(true);
    });
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => {
          const command = call[0];
          return (
            command.screen === 'list' &&
            command.action === 'load' &&
            command.values?.page === 2
          );
        }),
      ).toBe(true);
    });
  });

  it('shows empty CTAs, retry, and read-only cashier', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const empty = listSubmit({
      load: async () => ({ ok: true }),
    });
    render(
      <InventoryMfe
        data={data(feature('list', empty), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    expect(await screen.findByTestId('inventory-empty')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Open catalogue' }));
    expect(onNavigate).toHaveBeenCalledWith('/catalogue');
    await user.click(screen.getByRole('button', { name: 'Open purchases' }));
    expect(onNavigate).toHaveBeenCalledWith('/purchases');

    cleanup();
    const silent = listSubmit({
      load: async () => ({ ok: false }),
    });
    render(<InventoryMfe data={data(feature('list', silent))} />);
    expect(await screen.findByTestId('inventory-error')).toHaveTextContent(
      'Unable to load inventory.',
    );

    cleanup();
    const boom = listSubmit({
      load: async () => ({ ok: false, formError: 'Down' }),
      export: async () => ({ ok: false, code: 'MODULE_NOT_IN_PLAN' }),
    });
    render(<InventoryMfe data={data(feature('list', boom))} />);
    expect(await screen.findByTestId('inventory-error')).toHaveTextContent(
      'Down',
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(
      boom.mock.calls.filter((call) => call[0].action === 'load').length,
    ).toBeGreaterThan(1);

    cleanup();
    const cashier = listSubmit();
    render(
      <InventoryMfe
        data={data(feature('list', cashier, { canWrite: false }))}
      />,
    );
    expect(await screen.findByTestId('inventory-table')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Export Excel' })).toBeNull();
    expect(screen.getByText(/cannot change it/)).toBeTruthy();
  });

  it('uses fallbacks when export fails and summary is omitted', async () => {
    const user = userEvent.setup();
    const onSubmit = listSubmit({
      loadSummary: async () => ({ ok: true }),
      export: async () => ({ ok: false }),
    });
    render(<InventoryMfe data={data(feature('list', onSubmit))} />);
    expect(await screen.findByTestId('inventory-table')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Export Excel' }));
    expect(await screen.findByTestId('inventory-error')).toHaveTextContent(
      'Unable to export.',
    );
    cleanup();
    const sparse = listSubmit({
      load: async () => ({
        ok: true,
        products: [
          { product_id: 'prod-x', medicine_name: 'Morphine' },
          { product_id: 'prod-y', name: 'Listed', is_online_visible: true },
        ],
      }),
      loadSummary: async () => ({ ok: true, summary: {} }),
      export: async () => ({ ok: false, code: 'FORBIDDEN' }),
    });
    render(<InventoryMfe data={data(feature('list', sparse))} />);
    expect(await screen.findByTestId('inventory-row-prod-x')).toHaveTextContent(
      'Morphine',
    );
    expect(screen.getByTestId('inventory-row-prod-y')).toHaveTextContent(
      'Listed',
    );
    expect(screen.getByTestId('summary-total-products')).toHaveTextContent('0');
    await user.click(screen.getByRole('button', { name: 'Export Excel' }));
    expect(await screen.findByTestId('inventory-error')).toHaveTextContent(
      'FORBIDDEN',
    );

    await user.type(screen.getByLabelText('Search inventory'), 'crocin');
    await waitFor(() => {
      expect(
        sparse.mock.calls.some((call) => {
          const command = call[0];
          return (
            command.screen === 'list' &&
            command.action === 'load' &&
            command.values?.search === 'crocin'
          );
        }),
      ).toBe(true);
    });
  });
});

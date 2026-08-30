import type {
  InventoryCommand,
  InventorySubmitResult,
} from '@medmate/inventory-contract';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ALERTS, data, feature } from '../../../app/__tests__/helpers';
import InventoryMfe from '../../../app/InventoryMfe';

afterEach(() => {
  cleanup();
});

function expirySubmit(
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
      if (command.action === 'loadAlerts') {
        return {
          ok: true,
          alerts: [
            ...(ALERTS.ok ? (ALERTS.alerts ?? []) : []),
            { product_id: 'prod-bare', name: 'Bare' },
          ],
        };
      }
      if (command.action === 'loadReport') {
        return {
          ok: true,
          report: [{ product_id: 'prod-1', name: 'Crocin 500mg Tablet' }],
        };
      }
      return { ok: true, downloaded: true };
    },
  );
}

describe('ExpiryScreen', () => {
  it('renders alerts with product links and exports the report', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const onSubmit = expirySubmit();
    render(
      <InventoryMfe
        data={data(feature('expiry', onSubmit), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    expect(await screen.findByTestId('expiry-alerts')).toBeTruthy();
    await user.click(
      within(screen.getByTestId('expiry-alert-prod-1')).getByRole('button', {
        name: 'Open product',
      }),
    );
    expect(onNavigate).toHaveBeenCalledWith('/inventory/prod-1');
    await user.click(screen.getByRole('button', { name: 'Export report' }));
    expect(
      onSubmit.mock.calls.some((call) => call[0].action === 'exportReport'),
    ).toBe(true);
  });

  it('shows empty, retry, and hides report for staff', async () => {
    const user = userEvent.setup();
    const empty = expirySubmit({
      loadAlerts: async () => ({ ok: true }),
      loadReport: async () => ({ ok: true }),
    });
    render(<InventoryMfe data={data(feature('expiry', empty))} />);
    expect(await screen.findByTestId('expiry-empty')).toBeTruthy();

    cleanup();
    const boom = expirySubmit({
      loadAlerts: async () => ({ ok: false, formError: 'Down' }),
    });
    render(<InventoryMfe data={data(feature('expiry', boom))} />);
    expect(await screen.findByTestId('expiry-error')).toHaveTextContent('Down');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(
      boom.mock.calls.filter((call) => call[0].action === 'loadAlerts').length,
    ).toBeGreaterThan(1);

    cleanup();
    const staff = expirySubmit();
    render(
      <InventoryMfe
        data={data(
          feature('expiry', staff, {
            role: 'pharmacy_staff',
            canWriteOff: false,
          }),
        )}
      />,
    );
    expect(await screen.findByTestId('expiry-alerts')).toBeTruthy();
    expect(screen.queryByTestId('expiry-report')).toBeNull();
  });

  it('uses fallbacks when alerts fail without a message', async () => {
    const boom = expirySubmit({
      loadAlerts: async () => ({ ok: false }),
    });
    render(<InventoryMfe data={data(feature('expiry', boom))} />);
    expect(await screen.findByTestId('expiry-error')).toHaveTextContent(
      'Unable to load expiry alerts.',
    );
  });
});

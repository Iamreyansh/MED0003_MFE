import type {
  BillingCommand,
  BillingSubmitResult,
} from '@medmate/billing-contract';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { INVOICE_LIST, data, feature } from '../../../app/__tests__/helpers';
import BillingMfe from '../../../app/BillingMfe';

afterEach(() => {
  cleanup();
});

function invoicesSubmit(
  overrides: Partial<
    Record<BillingCommand['action'], () => Promise<BillingSubmitResult>>
  > = {},
) {
  return vi.fn(
    async (command: BillingCommand): Promise<BillingSubmitResult> => {
      const override = overrides[command.action];
      if (override) {
        return override();
      }
      if (command.action === 'load') {
        return INVOICE_LIST;
      }
      return { ok: true, downloaded: true };
    },
  );
}

describe('InvoicesScreen', () => {
  it('lists invoices and opens detail', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <BillingMfe
        data={data(feature('invoices', invoicesSubmit()), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    expect(await screen.findByTestId('invoices-table')).toBeTruthy();
    expect(screen.getByText('INV-1')).toBeTruthy();
    await user.click(screen.getByTestId('invoice-row-inv-1'));
    expect(onNavigate).toHaveBeenCalledWith('/invoices/inv-1');
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(onNavigate).toHaveBeenCalledTimes(2);
  });

  it('exports excel and retries after a load error', async () => {
    const user = userEvent.setup();
    const onSubmit = invoicesSubmit({
      load: vi
        .fn()
        .mockResolvedValueOnce({ ok: false, formError: 'Down' })
        .mockResolvedValue(INVOICE_LIST),
      exportExcel: vi
        .fn()
        .mockResolvedValue({ ok: false, formError: 'No export' }),
    });
    render(<BillingMfe data={data(feature('invoices', onSubmit))} />);
    expect(await screen.findByTestId('invoices-error')).toHaveTextContent(
      'Down',
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByTestId('invoices-table')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Export Excel' }));
    expect(await screen.findByTestId('invoices-error')).toHaveTextContent(
      'No export',
    );
  });

  it('shows empty CTA to POS and applies filters', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const onSubmit = invoicesSubmit({
      load: async () => ({ ok: true, invoices: [], meta: { page: 1 } }),
    });
    render(
      <BillingMfe
        data={data(feature('invoices', onSubmit), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    expect(await screen.findByTestId('invoices-empty')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Open POS' }));
    expect(onNavigate).toHaveBeenCalledWith('/pos');
    await user.type(screen.getByLabelText('From date'), '2026-08-01');
    await user.type(screen.getByLabelText('To date'), '2026-08-30');
    await user.type(screen.getByLabelText('Channel'), 'COUNTER');
    await user.type(screen.getByLabelText('Payment method'), 'CASH');
    await user.type(screen.getByLabelText('Search'), 'INV');
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => {
          const command = call[0];
          return (
            command.screen === 'invoices' &&
            command.action === 'load' &&
            command.values?.from_date === '2026-08-01' &&
            command.values?.q === 'INV'
          );
        }),
      ).toBe(true);
    });
  });

  it('pages when Core reports a next page', async () => {
    const user = userEvent.setup();
    const onSubmit = invoicesSubmit();
    render(<BillingMfe data={data(feature('invoices', onSubmit))} />);
    await screen.findByTestId('invoices-table');
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some(
          (call) =>
            call[0].screen === 'invoices' &&
            call[0].action === 'load' &&
            call[0].values?.page === 2,
        ),
      ).toBe(true);
    });
  });
});

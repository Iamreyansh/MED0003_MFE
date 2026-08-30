import type {
  BillingCommand,
  BillingSubmitResult,
} from '@medmate/billing-contract';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  KHATA_HISTORY,
  KHATA_LIST,
  data,
  feature,
} from '../../../app/__tests__/helpers';
import BillingMfe from '../../../app/BillingMfe';

afterEach(() => {
  cleanup();
});

function khataSubmit(
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
        return KHATA_LIST;
      }
      if (command.action === 'loadHistory') {
        return KHATA_HISTORY;
      }
      return { ok: true, downloaded: true };
    },
  );
}

describe('KhataScreen', () => {
  it('lists debtors and opens detail', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <BillingMfe
        data={data(feature('khata', khataSubmit()), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    expect(await screen.findByTestId('khata-table')).toBeTruthy();
    expect(screen.getByTestId('khata-summary')).toBeTruthy();
    expect(screen.getByText('Overdue')).toBeTruthy();
    await user.click(screen.getByTestId('khata-row-cust-1'));
    expect(onNavigate).toHaveBeenCalledWith('/khata/cust-1');
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(onNavigate).toHaveBeenCalledTimes(2);
  });

  it('shows payment history and export', async () => {
    const user = userEvent.setup();
    const onSubmit = khataSubmit();
    render(<BillingMfe data={data(feature('khata', onSubmit))} />);
    await screen.findByTestId('khata-table');
    await user.click(screen.getByRole('button', { name: 'Payments' }));
    expect(await screen.findByTestId('khata-history-table')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Export Excel' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'exportExcel'),
      ).toBe(true);
    });
  });

  it('locks free plan and retries after a load error', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <BillingMfe
        data={data(
          feature('khata', async () => ({
            ok: false,
            code: 'PLAN_FEATURE_LOCKED',
          })),
          { capabilities: { navigate: onNavigate } },
        )}
      />,
    );
    expect(await screen.findByTestId('khata-plan-lock')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'View plans' }));
    expect(onNavigate).toHaveBeenCalledWith('/subscription');

    cleanup();
    const onSubmit = khataSubmit({
      load: vi
        .fn()
        .mockResolvedValueOnce({ ok: false, formError: 'Down' })
        .mockResolvedValue(KHATA_LIST),
    });
    render(<BillingMfe data={data(feature('khata', onSubmit))} />);
    expect(await screen.findByTestId('khata-error')).toHaveTextContent('Down');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByTestId('khata-table')).toBeTruthy();
  });

  it('shows empty debtors and empty history', async () => {
    const user = userEvent.setup();
    const onSubmit = khataSubmit({
      load: async () => ({ ok: true, customers: [], kpi: {} }),
      loadHistory: async () => ({ ok: true, repayments: [] }),
    });
    render(<BillingMfe data={data(feature('khata', onSubmit))} />);
    expect(await screen.findByTestId('khata-empty')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Payments' }));
    expect(await screen.findByTestId('khata-history-empty')).toBeTruthy();
  });

  it('applies debtor filters and history errors', async () => {
    const user = userEvent.setup();
    const onSubmit = khataSubmit({
      loadHistory: vi
        .fn()
        .mockResolvedValueOnce({ ok: false, formError: 'History down' })
        .mockResolvedValue(KHATA_HISTORY),
      exportExcel: async () => ({ ok: false, formError: 'No export' }),
    });
    render(<BillingMfe data={data(feature('khata', onSubmit))} />);
    await screen.findByTestId('khata-table');
    await user.type(screen.getByLabelText('Search'), 'Ramesh');
    await user.selectOptions(screen.getByLabelText('Sort'), 'oldest_bill');
    await user.selectOptions(screen.getByLabelText('Overdue only'), 'true');
    await user.click(screen.getByRole('button', { name: 'Payments' }));
    expect(await screen.findByTestId('khata-error')).toHaveTextContent(
      'History down',
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByTestId('khata-history-table')).toBeTruthy();
    await user.type(screen.getByLabelText('From date'), '2026-07-01');
    await user.type(screen.getByLabelText('To date'), '2026-07-31');
    await user.type(screen.getByLabelText('Payment mode'), 'CASH');
    await user.click(screen.getByRole('button', { name: 'Export Excel' }));
    expect(await screen.findByTestId('khata-error')).toHaveTextContent(
      'No export',
    );
    await user.click(screen.getByRole('button', { name: 'Debtors' }));
    expect(await screen.findByTestId('khata-table')).toBeTruthy();
  });

  it('locks history and export, and marks current rows', async () => {
    const user = userEvent.setup();
    const onSubmit = khataSubmit({
      load: async () => ({
        ok: true,
        customers: [
          { customer_id: 'cust-2', name: 'Current', outstanding: 10 },
        ],
        kpi: {},
      }),
      loadHistory: async () => ({
        ok: false,
        code: 'PLAN_FEATURE_LOCKED',
      }),
    });
    render(<BillingMfe data={data(feature('khata', onSubmit))} />);
    expect(await screen.findByTestId('khata-row-cust-2')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Payments' }));
    expect(await screen.findByTestId('khata-plan-lock')).toBeTruthy();

    cleanup();
    const exporting = khataSubmit({
      exportExcel: async () => ({
        ok: false,
        code: 'PLAN_FEATURE_LOCKED',
      }),
    });
    render(<BillingMfe data={data(feature('khata', exporting))} />);
    await screen.findByTestId('khata-table');
    await user.click(screen.getByRole('button', { name: 'Payments' }));
    await screen.findByTestId('khata-history-table');
    await user.click(screen.getByRole('button', { name: 'Export Excel' }));
    expect(await screen.findByTestId('khata-plan-lock')).toBeTruthy();
  });

  it('renders aging fallbacks and history rows without ids', async () => {
    const user = userEvent.setup();
    const onSubmit = khataSubmit({
      load: async () => ({
        ok: true,
        customers: [
          { customer_id: 'cust-3', name: 'No phone', outstanding: 1 },
        ],
        kpi: { collection_rate_pct: 10 },
        aging: {},
      }),
      loadHistory: async () => ({
        ok: true,
        repayments: [{ receipt_number: 'RCPT-X', amount: 1 }],
      }),
    });
    render(
      <BillingMfe
        data={data(feature('khata', onSubmit, { role: 'pharmacy_staff' }))}
      />,
    );
    expect(await screen.findByTestId('khata-aging')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Payments' }));
    expect(await screen.findByTestId('khata-history-table')).toHaveTextContent(
      'RCPT-X',
    );

    cleanup();
    render(
      <BillingMfe
        data={data(
          feature('khata', khataSubmit({
            load: async () => ({
              ok: true,
              customers: [{ customer_id: 'cust-4', name: 'Bare' }],
            }),
          })),
        )}
      />,
    );
    expect(await screen.findByTestId('khata-table')).toBeTruthy();
    expect(screen.queryByTestId('khata-summary')).toBeNull();
  });
});

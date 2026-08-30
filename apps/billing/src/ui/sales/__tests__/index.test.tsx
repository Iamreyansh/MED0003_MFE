import type {
  BillingCommand,
  BillingSubmitResult,
} from '@medmate/billing-contract';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  SALE_DETAIL,
  SALES_LIST,
  SALES_SUMMARY,
  data,
  feature,
} from '../../../app/__tests__/helpers';
import BillingMfe from '../../../app/BillingMfe';

afterEach(() => {
  cleanup();
});

function salesSubmit(
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
        return SALES_LIST;
      }
      if (command.action === 'loadSummary') {
        return SALES_SUMMARY;
      }
      if (command.action === 'loadSale') {
        return SALE_DETAIL;
      }
      return { ok: true };
    },
  );
}

describe('SalesScreen', () => {
  it('shows summary cards, opens sale detail, and marks paid', async () => {
    const user = userEvent.setup();
    const onSubmit = salesSubmit();
    render(<BillingMfe data={data(feature('sales', onSubmit))} />);
    expect(await screen.findByTestId('sales-summary')).toBeTruthy();
    expect(screen.getByTestId('summary-total-bills')).toHaveTextContent('1');
    await user.click(screen.getByTestId('sale-row-inv-1'));
    expect(await screen.findByTestId('sale-detail')).toBeTruthy();
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByTestId('sale-detail')).toBeNull();
    });
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByTestId('sale-detail')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Close sale' }));
    await user.click(screen.getByRole('button', { name: 'Mark paid' }));
    expect(screen.getByTestId('mark-paid-dialog')).toBeTruthy();
    await user.selectOptions(screen.getByLabelText('Payment mode'), 'UPI');
    await user.clear(screen.getByLabelText('Amount'));
    await user.type(screen.getByLabelText('Amount'), '291.2');
    await user.type(screen.getByLabelText('Reference number'), 'UPI-1');
    await user.type(screen.getByLabelText('Note'), 'Collected');
    await user.click(screen.getByRole('button', { name: 'Confirm payment' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some(
          (call) =>
            call[0].action === 'markPaid' &&
            call[0].values &&
            'payment_mode' in call[0].values &&
            call[0].values.payment_mode === 'UPI',
        ),
      ).toBe(true);
    });
  });

  it('cancels mark-paid, hides it for staff, and handles errors', async () => {
    const user = userEvent.setup();
    const onSubmit = salesSubmit();
    render(<BillingMfe data={data(feature('sales', onSubmit))} />);
    await screen.findByTestId('sales-table');
    await user.click(screen.getByRole('button', { name: 'Mark paid' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(
      onSubmit.mock.calls.some((call) => call[0].action === 'markPaid'),
    ).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Mark paid' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByTestId('mark-paid-dialog')).toBeNull();

    cleanup();
    render(
      <BillingMfe
        data={data(
          feature('sales', salesSubmit(), {
            role: 'pharmacy_staff',
            canMarkPaid: false,
          }),
        )}
      />,
    );
    await screen.findByTestId('sales-table');
    expect(screen.queryByRole('button', { name: 'Mark paid' })).toBeNull();

    cleanup();
    const failing = salesSubmit({
      load: vi
        .fn()
        .mockResolvedValueOnce({ ok: false, formError: 'Down' })
        .mockResolvedValue(SALES_LIST),
      loadSale: async () => ({ ok: false, formError: 'Missing sale' }),
      exportExcel: async () => ({ ok: false, formError: 'No export' }),
      markPaid: async () => ({ ok: false, formError: 'Already paid' }),
    });
    render(<BillingMfe data={data(feature('sales', failing))} />);
    expect(await screen.findByTestId('sales-error')).toHaveTextContent('Down');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByTestId('sales-table');
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByTestId('sales-error')).toHaveTextContent(
      'Missing sale',
    );
    await user.click(screen.getByRole('button', { name: 'Export Excel' }));
    expect(await screen.findByTestId('sales-error')).toHaveTextContent(
      'No export',
    );
    await user.click(screen.getByRole('button', { name: 'Mark paid' }));
    await user.click(screen.getByRole('button', { name: 'Confirm payment' }));
    expect(await screen.findByTestId('sales-error')).toHaveTextContent(
      'Already paid',
    );
  });

  it('shows an empty day and applies date filters', async () => {
    const user = userEvent.setup();
    const onSubmit = salesSubmit({
      load: async () => ({ ok: true, sales: [], meta: { page: 1 } }),
    });
    render(<BillingMfe data={data(feature('sales', onSubmit))} />);
    expect(await screen.findByTestId('sales-empty')).toBeTruthy();
    await user.type(screen.getByLabelText('From date'), '2026-08-01');
    await user.type(screen.getByLabelText('To date'), '2026-08-30');
    await user.type(screen.getByLabelText('Channel'), 'ONLINE');
    await user.type(screen.getByLabelText('Payment method'), 'UPI');
    await user.type(screen.getByLabelText('Payment status'), 'PAID');
    await user.type(screen.getByLabelText('Search'), 'INV');
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some(
          (call) =>
            call[0].screen === 'sales' &&
            call[0].action === 'load' &&
            call[0].values?.from_date === '2026-08-01',
        ),
      ).toBe(true);
    });
  });

  it('omits mark-paid for already paid rows', async () => {
    render(
      <BillingMfe
        data={data(
          feature('sales', async (command) => {
            if (command.action === 'loadSummary') {
              return SALES_SUMMARY;
            }
            return {
              ok: true,
              sales: [
                {
                  sale_id: 'paid-1',
                  invoice_number: 'INV-9',
                  payment_status: 'PAID',
                  grand_total: 10,
                },
              ],
            };
          }),
        )}
      />,
    );
    await screen.findByTestId('sales-table');
    expect(screen.queryByRole('button', { name: 'Mark paid' })).toBeNull();
  });

  it('keeps the ledger when summary is missing or fails', async () => {
    const { rerender } = render(
      <BillingMfe
        data={data(
          feature('sales', async (command) => {
            if (command.action === 'loadSummary') {
              return { ok: true };
            }
            return SALES_LIST;
          }),
        )}
      />,
    );
    expect(await screen.findByTestId('sales-table')).toBeTruthy();
    expect(screen.queryByTestId('sales-summary')).toBeNull();
    rerender(
      <BillingMfe
        data={data(
          feature('sales', async (command) => {
            if (command.action === 'loadSummary') {
              return { ok: false, formError: 'No summary' };
            }
            return SALES_LIST;
          }),
        )}
      />,
    );
    expect(await screen.findByTestId('sales-table')).toBeTruthy();
  });

  it('marks paid without a prefilled amount and empty summary cards', async () => {
    const user = userEvent.setup();
    const onSubmit = salesSubmit({
      load: async () => ({
        ok: true,
        sales: [
          {
            sale_id: 'open-1',
            invoice_number: 'INV-2',
            payment_status: 'PENDING',
          },
        ],
      }),
      loadSummary: async () => ({ ok: true, summary: {} }),
      loadSale: async () => ({ ok: true }),
    });
    render(<BillingMfe data={data(feature('sales', onSubmit))} />);
    await screen.findByTestId('sales-table');
    expect(screen.getByTestId('summary-total-bills')).toHaveTextContent('0');
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Mark paid' }));
    await user.click(screen.getByRole('button', { name: 'Confirm payment' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'markPaid'),
      ).toBe(true);
    });
  });
});

import type {
  BillingCommand,
  BillingSubmitResult,
} from '@medmate/billing-contract';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { KHATA_DETAIL, data, feature } from '../../../app/__tests__/helpers';
import BillingMfe from '../../../app/BillingMfe';

afterEach(() => {
  cleanup();
});

function detailSubmit(
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
        return KHATA_DETAIL;
      }
      return { ok: true };
    },
  );
}

describe('KhataDetailScreen', () => {
  it('loads ledger and records one repayment intent', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit();
    render(<BillingMfe data={data(feature('khata-detail', onSubmit))} />);
    expect(await screen.findByTestId('khata-ledger')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Record repayment' }));
    expect(screen.getByTestId('khata-repay-dialog')).toBeTruthy();
    expect(screen.getByLabelText('Amount')).toBeTruthy();
    await user.selectOptions(screen.getByLabelText('Payment mode'), 'UPI');
    await user.clear(screen.getByLabelText('Amount'));
    await user.type(screen.getByLabelText('Amount'), '5000');
    await user.click(screen.getByRole('button', { name: 'Confirm repayment' }));
    await waitFor(() => {
      const repay = onSubmit.mock.calls.filter(
        (call) => call[0].action === 'repay',
      );
      expect(repay).toHaveLength(1);
      expect(repay[0]?.[0]).toMatchObject({
        values: { amount: 5000, payment_mode: 'UPI' },
      });
    });
  });

  it('hides remind for staff and shows forbidden when Core 403s', async () => {
    const user = userEvent.setup();
    render(
      <BillingMfe
        data={data(
          feature('khata-detail', detailSubmit(), {
            role: 'pharmacy_staff',
            canRemind: false,
          }),
        )}
      />,
    );
    await screen.findByTestId('khata-ledger');
    expect(screen.queryByRole('button', { name: 'Send reminder' })).toBeNull();

    cleanup();
    const onSubmit = detailSubmit({
      remind: async () => ({
        ok: false,
        code: 'STAFF_CANNOT_REMIND',
        formError: 'Only the owner can send reminders.',
      }),
    });
    render(<BillingMfe data={data(feature('khata-detail', onSubmit))} />);
    await screen.findByTestId('khata-ledger');
    await user.click(screen.getByRole('button', { name: 'Send reminder' }));
    await user.click(screen.getByRole('button', { name: 'Send reminder' }));
    expect(await screen.findByTestId('khata-detail-error')).toHaveTextContent(
      /owner/i,
    );
  });

  it('shows not-found and plan lock', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <BillingMfe
        data={data(
          feature('khata-detail', async () => ({
            ok: false,
            code: 'CUSTOMER_NOT_FOUND',
          })),
        )}
      />,
    );
    expect(await screen.findByTestId('khata-not-found')).toBeTruthy();

    cleanup();
    render(
      <BillingMfe
        data={data(
          feature('khata-detail', async () => ({
            ok: false,
            code: 'PLAN_FEATURE_LOCKED',
          })),
          { capabilities: { navigate: onNavigate } },
        )}
      />,
    );
    expect(await screen.findByTestId('khata-detail-plan-lock')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'View plans' }));
    expect(onNavigate).toHaveBeenCalledWith('/subscription');
  });

  it('renders sparse ledger fields and summary outstanding', async () => {
    const user = userEvent.setup();
    render(
      <BillingMfe
        data={data(
          feature('khata-detail', async () => ({
            ok: true,
            khata: {
              customer: {},
              summary: { total_outstanding: 1200, overdue_amount: 200 },
              unpaid_bills: [{ invoice_number: 'INV-X', amount: 200 }],
              ledger: [{ type: 'CREDIT', amount: 200, running_balance: 1200 }],
            },
          })),
        )}
      />,
    );
    expect(await screen.findByTestId('khata-unpaid')).toHaveTextContent('INV-X');
    expect(screen.getByTestId('khata-ledger')).toHaveTextContent('CREDIT');
    expect(screen.getByTestId('khata-outstanding')).toHaveTextContent('1,200');
    await user.click(screen.getByRole('button', { name: 'Record repayment' }));
    expect(screen.getByLabelText('Amount')).toHaveValue(null);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByTestId('khata-repay-dialog')).toBeNull();

    cleanup();
    const failing = detailSubmit({
      repay: async () => ({ ok: false, formError: 'Ledger busy' }),
    });
    render(<BillingMfe data={data(feature('khata-detail', failing))} />);
    await screen.findByTestId('khata-ledger');
    await user.click(screen.getByRole('button', { name: 'Record repayment' }));
    await user.click(screen.getByRole('button', { name: 'Confirm repayment' }));
    expect(await screen.findByTestId('khata-detail-error')).toHaveTextContent(
      'Ledger busy',
    );

    cleanup();
    render(
      <BillingMfe
        data={data(feature('khata-detail', async () => ({ ok: true })))}
      />,
    );
    expect(await screen.findByTestId('khata-unpaid-empty')).toBeTruthy();
  });

  it('sends an owner reminder template', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit();
    render(<BillingMfe data={data(feature('khata-detail', onSubmit))} />);
    await screen.findByTestId('khata-ledger');
    await user.click(screen.getByRole('button', { name: 'Send reminder' }));
    await user.selectOptions(screen.getByLabelText('Channel'), 'SMS');
    await user.selectOptions(screen.getByLabelText('Template'), 'FIRM');
    await user.click(screen.getByRole('button', { name: 'Send reminder' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some(
          (call) =>
            call[0].action === 'remind' &&
            call[0].values &&
            'channel' in call[0].values &&
            call[0].values.channel === 'SMS',
        ),
      ).toBe(true);
    });
  });

  it('validates amount, cancels dialogs, and retries load errors', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit({
      load: vi
        .fn()
        .mockResolvedValueOnce({ ok: false, formError: 'Down' })
        .mockResolvedValue(KHATA_DETAIL),
      repay: async () => ({
        ok: false,
        fieldErrors: { amount: 'Too high' },
        formError: 'Too high',
      }),
    });
    render(<BillingMfe data={data(feature('khata-detail', onSubmit))} />);
    expect(await screen.findByTestId('khata-detail-error')).toHaveTextContent(
      'Down',
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByTestId('khata-ledger');
    await user.click(screen.getByRole('button', { name: 'Record repayment' }));
    await user.clear(screen.getByLabelText('Amount'));
    await user.click(screen.getByRole('button', { name: 'Confirm repayment' }));
    expect(screen.getByText('Enter a valid amount.')).toBeTruthy();
    await user.type(screen.getByLabelText('Amount'), '5000');
    await user.type(screen.getByLabelText('Note'), 'Cash');
    await user.click(screen.getByRole('button', { name: 'Confirm repayment' }));
    expect(await screen.findByTestId('khata-detail-error')).toHaveTextContent(
      'Too high',
    );
    await user.keyboard('{Escape}');
    expect(screen.queryByTestId('khata-repay-dialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Send reminder' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByTestId('khata-remind-dialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Send reminder' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByTestId('khata-remind-dialog')).toBeNull();
  });

  it('handles empty ledger, missing id, and repay lock', async () => {
    const user = userEvent.setup();
    render(
      <BillingMfe
        data={data(
          feature('khata-detail', async () => ({
            ok: true,
            khata: {
              customer: { name: 'Empty' },
              unpaid_bills: [],
              ledger: [],
            },
          })),
        )}
      />,
    );
    expect(await screen.findByTestId('khata-unpaid-empty')).toBeTruthy();
    expect(screen.getByTestId('khata-ledger-empty')).toBeTruthy();

    cleanup();
    render(
      <BillingMfe
        data={data(
          feature('khata-detail', detailSubmit(), { customerId: null }),
        )}
      />,
    );
    expect(await screen.findByTestId('khata-not-found')).toBeTruthy();

    cleanup();
    const onSubmit = detailSubmit({
      repay: async () => ({ ok: false, code: 'PLAN_FEATURE_LOCKED' }),
      remind: async () => ({ ok: false, code: 'PLAN_FEATURE_LOCKED' }),
    });
    render(<BillingMfe data={data(feature('khata-detail', onSubmit))} />);
    await screen.findByTestId('khata-ledger');
    await user.click(screen.getByRole('button', { name: 'Record repayment' }));
    await user.click(screen.getByRole('button', { name: 'Confirm repayment' }));
    expect(await screen.findByTestId('khata-detail-plan-lock')).toBeTruthy();
  });

  it('locks remind and maps forbidden copy', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit({
      remind: async () => ({ ok: false, code: 'FORBIDDEN' }),
    });
    render(<BillingMfe data={data(feature('khata-detail', onSubmit))} />);
    await screen.findByTestId('khata-ledger');
    await user.click(screen.getByRole('button', { name: 'Send reminder' }));
    await user.click(screen.getByRole('button', { name: 'Send reminder' }));
    expect(await screen.findByTestId('khata-detail-error')).toHaveTextContent(
      /owner|permission|forbidden/i,
    );

    cleanup();
    const locking = detailSubmit({
      remind: async () => ({ ok: false, formError: 'Rate limited' }),
    });
    render(<BillingMfe data={data(feature('khata-detail', locking))} />);
    await screen.findByTestId('khata-ledger');
    await user.click(screen.getByRole('button', { name: 'Send reminder' }));
    await user.click(screen.getByRole('button', { name: 'Send reminder' }));
    expect(await screen.findByTestId('khata-detail-error')).toHaveTextContent(
      'Rate limited',
    );

    cleanup();
    const remindLock = detailSubmit({
      remind: async () => ({ ok: false, code: 'PLAN_FEATURE_LOCKED' }),
    });
    render(<BillingMfe data={data(feature('khata-detail', remindLock))} />);
    await screen.findByTestId('khata-ledger');
    await user.click(screen.getByRole('button', { name: 'Send reminder' }));
    await user.click(screen.getByRole('button', { name: 'Send reminder' }));
    expect(await screen.findByTestId('khata-detail-plan-lock')).toBeTruthy();
  });
});

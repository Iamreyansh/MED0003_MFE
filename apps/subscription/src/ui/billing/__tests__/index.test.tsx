import type {
  SubscriptionCommand,
  SubscriptionSubmitResult,
} from '@medmate/subscription-contract';
import { publicPayFields } from '@medmate/subscription-contract';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature } from '../../../app/__tests__/helpers';
import SubscriptionMfe from '../../../app/SubscriptionMfe';

afterEach(() => {
  cleanup();
  window.history.replaceState({}, '', '/');
});

function billingSubmit(
  overrides: Partial<
    Record<
      SubscriptionCommand['action'],
      () => Promise<SubscriptionSubmitResult>
    >
  > = {},
) {
  return vi.fn(
    async (command: SubscriptionCommand): Promise<SubscriptionSubmitResult> => {
      const override = overrides[command.action];
      if (override) {
        return override();
      }
      if (command.action === 'load') {
        return {
          ok: true,
          invoices: [{ id: 'inv-1', status: 'unpaid', amount_rs: 499 }],
        };
      }
      return { ok: true };
    },
  );
}

describe('BillingScreen', () => {
  it('lists invoices and pays with a reused idempotency key', async () => {
    const onNavigate = vi.fn();
    const onSubmit = billingSubmit({
      pay: async () => ({
        ok: true,
        pay: {
          payment_link: 'https://payments.example/pay',
          cashfree_secret: 'nope',
        } as never,
      }),
    });
    const user = userEvent.setup();
    render(
      <SubscriptionMfe
        data={data(feature('billing', onSubmit), {
          capabilities: {
            navigate: onNavigate,
            api: {
              request: async <T = unknown,>() => ({
                ok: true,
                status: 200,
                data: {} as T,
              }),
              createIdempotencyKey: () => 'pay-key',
            },
          },
        })}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('invoice-inv-1')).toBeTruthy();
    });
    await user.click(screen.getByRole('button', { name: 'Pay' }));
    await waitFor(() => {
      expect(onNavigate).toHaveBeenCalledWith('https://payments.example/pay');
    });
    expect(onSubmit).toHaveBeenCalledWith({
      screen: 'billing',
      action: 'pay',
      values: { invoice_id: 'inv-1', idempotencyKey: 'pay-key' },
    });
    expect(
      publicPayFields({
        payment_link: 'https://payments.example/pay',
        cashfree_secret: 'nope',
      }),
    ).not.toHaveProperty('cashfree_secret');
  });

  it('shows processing after return URL refetch when still unpaid', async () => {
    window.history.replaceState({}, '', '/?invoice_id=inv-return');
    const onSubmit = billingSubmit({
      loadInvoice: async () => ({
        ok: true,
        invoice: { id: 'inv-return', status: 'unpaid', amount_rs: 499 },
      }),
    });
    render(<SubscriptionMfe data={data(feature('billing', onSubmit))} />);
    await waitFor(() => {
      expect(screen.getByTestId('billing-processing')).toBeTruthy();
    });
  });

  it('hides Pay when SaaS payments are disabled', async () => {
    render(
      <SubscriptionMfe
        data={data(feature('billing', billingSubmit(), { disabled: true }))}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('invoice-inv-1')).toBeTruthy();
    });
    expect(screen.queryByRole('button', { name: 'Pay' })).toBeNull();
    expect(screen.getByText(/not enabled in this environment/i)).toBeTruthy();
  });

  it('shows empty, forbidden, and fail-closed pay errors', async () => {
    const empty = billingSubmit({
      load: async () => ({ ok: true }),
    });
    const { rerender } = render(
      <SubscriptionMfe data={data(feature('billing', empty))} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('billing-empty')).toBeTruthy();
    });

    rerender(
      <SubscriptionMfe
        data={data(
          feature(
            'billing',
            billingSubmit({
              load: async () => ({
                ok: false,
                code: 'FORBIDDEN',
                formError: 'No',
              }),
            }),
            { canWrite: false, role: 'pharmacy_staff' },
          ),
        )}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('billing-forbidden')).toBeTruthy();
    });

    const failingPay = billingSubmit({
      pay: async () => ({
        ok: false,
        code: 'VALIDATION_ERROR',
        formError: 'Gateway closed',
      }),
    });
    rerender(<SubscriptionMfe data={data(feature('billing', failingPay))} />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Pay' })).toBeEnabled();
    });
    await userEvent.click(screen.getByRole('button', { name: 'Pay' }));
    await waitFor(() => {
      expect(screen.getByTestId('billing-error')).toHaveTextContent(
        'VALIDATION_ERROR',
      );
    });
    expect(screen.queryByText(/paid/i)).toBeTruthy();
  });

  it('ignores a failed return refetch and hides Pay on paid rows', async () => {
    window.history.replaceState({}, '', '/?invoice_id=inv-miss');
    const onSubmit = billingSubmit({
      load: async () => ({
        ok: true,
        invoices: [{ id: 'inv-paid', status: 'paid', amount_rs: 100 }],
      }),
      loadInvoice: async () => ({
        ok: false,
        code: 'INVOICE_NOT_FOUND',
        formError: 'Gone',
      }),
    });
    render(<SubscriptionMfe data={data(feature('billing', onSubmit))} />);
    await waitFor(() => {
      expect(screen.getByTestId('invoice-inv-paid')).toBeTruthy();
    });
    expect(screen.queryByRole('button', { name: 'Pay' })).toBeNull();
    expect(screen.queryByTestId('billing-processing')).toBeNull();
  });

  it('uses fallback error copy and a dash when invoice status is missing', async () => {
    const onSubmit = billingSubmit({
      load: async () => ({
        ok: false,
        code: undefined,
        formError: undefined,
      }),
    });
    const { rerender } = render(
      <SubscriptionMfe data={data(feature('billing', onSubmit))} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('billing-error')).toHaveTextContent(
        'Unable to load invoices.',
      );
    });
    rerender(
      <SubscriptionMfe
        data={data(
          feature(
            'billing',
            billingSubmit({
              load: async () => ({
                ok: true,
                invoices: [{ id: 'inv-bare' }],
              }),
              pay: async () => ({ ok: false }),
            }),
          ),
        )}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('invoice-inv-bare')).toHaveTextContent('—');
    });
    await userEvent.click(screen.getByRole('button', { name: 'Pay' }));
    await waitFor(() => {
      expect(screen.getByTestId('billing-error')).toHaveTextContent(
        'Unable to start payment.',
      );
    });
  });

  it('disables Pay while in flight and surfaces a session-only handoff', async () => {
    let finishPay: (value: SubscriptionSubmitResult) => void = () => undefined;
    const pending = new Promise<SubscriptionSubmitResult>((resolve) => {
      finishPay = resolve;
    });
    const onSubmit = billingSubmit({
      pay: async () => pending,
    });
    const user = userEvent.setup();
    render(<SubscriptionMfe data={data(feature('billing', onSubmit))} />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Pay' })).toBeEnabled();
    });
    await user.click(screen.getByRole('button', { name: 'Pay' }));
    expect(screen.getByRole('button', { name: 'Pay' })).toBeDisabled();
    finishPay({
      ok: true,
      pay: { payment_session_id: 'sess_1' },
    });
    await waitFor(() => {
      expect(screen.getByTestId('billing-session')).toBeTruthy();
    });
  });
});

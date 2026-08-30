import type {
  BillingCommand,
  BillingSubmitResult,
} from '@medmate/billing-contract';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { INVOICE_DETAIL, data, feature } from '../../../app/__tests__/helpers';
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
        return INVOICE_DETAIL;
      }
      return { ok: true };
    },
  );
}

describe('InvoiceDetailScreen', () => {
  it('renders lines, GST slabs, PDF, and share', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit();
    render(<BillingMfe data={data(feature('invoice-detail', onSubmit))} />);
    expect(await screen.findByTestId('invoice-lines')).toBeTruthy();
    expect(screen.getByTestId('invoice-gst')).toHaveTextContent('12%');
    expect(screen.getByTestId('invoice-customer')).toHaveTextContent('Ravi');
    await user.click(screen.getByRole('button', { name: 'Download PDF' }));
    await user.type(screen.getByLabelText('Phone or email'), '+919999999999');
    await user.selectOptions(screen.getByLabelText('Share channel'), 'SMS');
    await user.click(screen.getByRole('button', { name: 'Share' }));
    expect(await screen.findByTestId('invoice-shared')).toBeTruthy();
    expect(
      onSubmit.mock.calls.some(
        (call) =>
          call[0].action === 'pdf' && call[0].values?.invoiceId === 'inv-1',
      ),
    ).toBe(true);
    expect(
      onSubmit.mock.calls.some(
        (call) =>
          call[0].action === 'share' &&
          call[0].values &&
          'channel' in call[0].values &&
          call[0].values.channel === 'SMS',
      ),
    ).toBe(true);
  });

  it('shows not-found, missing id, load error, and share/pdf failures', async () => {
    const user = userEvent.setup();
    render(
      <BillingMfe
        data={data(
          feature(
            'invoice-detail',
            async () => ({ ok: false, code: 'INVOICE_NOT_FOUND' }),
            { invoiceId: 'missing' },
          ),
        )}
      />,
    );
    expect(await screen.findByTestId('invoice-not-found')).toBeTruthy();

    cleanup();
    render(
      <BillingMfe
        data={data(
          feature('invoice-detail', async () => ({ ok: true }), {
            invoiceId: null,
          }),
        )}
      />,
    );
    expect(await screen.findByTestId('invoice-not-found')).toBeTruthy();

    cleanup();
    const onSubmit = detailSubmit({
      load: vi
        .fn()
        .mockResolvedValueOnce({ ok: false, formError: 'Down' })
        .mockResolvedValue(INVOICE_DETAIL),
      pdf: async () => ({ ok: false, formError: 'PDF failed' }),
      share: async () => ({ ok: false, formError: 'Share failed' }),
    });
    render(<BillingMfe data={data(feature('invoice-detail', onSubmit))} />);
    expect(await screen.findByTestId('invoice-detail-error')).toHaveTextContent(
      'Down',
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByTestId('invoice-lines');
    await user.click(screen.getByRole('button', { name: 'Download PDF' }));
    expect(await screen.findByTestId('invoice-detail-error')).toHaveTextContent(
      'PDF failed',
    );
    await user.click(screen.getByRole('button', { name: 'Share' }));
    expect(await screen.findByTestId('invoice-detail-error')).toHaveTextContent(
      'Share failed',
    );
  });

  it('renders empty invoice and unnamed line fallbacks', async () => {
    render(
      <BillingMfe
        data={data(
          feature('invoice-detail', async () => ({
            ok: true,
            invoice: {
              invoice_id: 'inv-1',
              line_items: [{ quantity: 1 }],
              gst_breakdown: [{ taxable_amount: 10 }],
            },
          })),
        )}
      />,
    );
    expect(await screen.findByTestId('invoice-lines')).toBeTruthy();
    expect(screen.getByTestId('invoice-gst')).toBeTruthy();
  });

  it('clears detail when Core returns no invoice payload', async () => {
    render(
      <BillingMfe
        data={data(feature('invoice-detail', async () => ({ ok: true })))}
      />,
    );
    expect(await screen.findByTestId('invoice-lines')).toBeTruthy();
  });
});

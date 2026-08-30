import type {
  BillingCommand,
  BillingSubmitResult,
} from '@medmate/billing-contract';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SETTINGS, data, feature } from '../../../app/__tests__/helpers';
import BillingMfe from '../../../app/BillingMfe';

afterEach(() => {
  cleanup();
});

function settingsSubmit(
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
        return SETTINGS;
      }
      return {
        ok: true,
        settings: SETTINGS.ok ? SETTINGS.settings : undefined,
      };
    },
  );
}

describe('InvoiceSettingsScreen', () => {
  it('fills fields and saves a valid patch', async () => {
    const user = userEvent.setup();
    const onSubmit = settingsSubmit();
    render(<BillingMfe data={data(feature('invoice-settings', onSubmit))} />);
    expect(await screen.findByLabelText('Invoice prefix')).toHaveValue('INV');
    await user.clear(screen.getByLabelText('Invoice prefix'));
    await user.type(screen.getByLabelText('Invoice prefix'), 'GST');
    await user.clear(screen.getByLabelText('Accent colour'));
    await user.type(screen.getByLabelText('Accent colour'), '#000000');
    await user.type(screen.getByLabelText('Document title'), ' Bill');
    await user.type(screen.getByLabelText('Signatory label'), 'Owner');
    await user.type(screen.getByLabelText('Logo URL'), 'https://x/l.png');
    await user.type(screen.getByLabelText('Signature URL'), 'https://x/s.png');
    await user.type(screen.getByLabelText('Bank name'), ' HDFC');
    await user.type(screen.getByLabelText('Account number'), '1');
    await user.type(screen.getByLabelText('IFSC'), 'X');
    await user.type(screen.getByLabelText('UPI id'), 'a@upi');
    await user.type(screen.getByLabelText('Terms and conditions'), 'Pay now');
    await user.type(screen.getByLabelText('Footer note'), 'Thanks');
    await user.click(screen.getByLabelText('Show HSN'));
    await user.click(screen.getByLabelText('Show MRP savings'));
    await user.click(screen.getByLabelText('Show prescribing doctor'));
    await user.click(screen.getByLabelText('Print bank details'));
    await user.selectOptions(screen.getByLabelText('Template'), 'MINIMAL');
    await user.click(screen.getByRole('button', { name: 'Save settings' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some(
          (call) =>
            call[0].action === 'save' &&
            call[0].values &&
            'invoice_prefix' in call[0].values &&
            call[0].values.invoice_prefix === 'GST',
        ),
      ).toBe(true);
    });
  });

  it('maps field errors, staff read-only, plan lock, and retry', async () => {
    const user = userEvent.setup();
    const onSubmit = settingsSubmit({
      save: async () => ({
        ok: false,
        code: 'VALIDATION_ERROR',
        formError: 'Check fields',
        fieldErrors: {
          invoice_prefix: 'Invalid prefix',
          accent_color: 'Bad colour',
          ifsc_code: 'Bad IFSC',
        },
      }),
    });
    render(<BillingMfe data={data(feature('invoice-settings', onSubmit))} />);
    await screen.findByLabelText('Invoice prefix');
    await user.type(screen.getByLabelText('Invoice prefix'), 'X');
    await user.click(screen.getByRole('button', { name: 'Save settings' }));
    expect(await screen.findByText('Invalid prefix')).toBeTruthy();
    expect(screen.getByText('Bad colour')).toBeTruthy();
    expect(screen.getByText('Bad IFSC')).toBeTruthy();

    cleanup();
    render(
      <BillingMfe
        data={data(
          feature('invoice-settings', settingsSubmit(), {
            role: 'pharmacy_staff',
            canPatchSettings: false,
          }),
        )}
      />,
    );
    expect(await screen.findByTestId('invoice-settings-readonly')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Save settings' })).toBeNull();

    cleanup();
    const onNavigate = vi.fn();
    render(
      <BillingMfe
        data={data(
          feature('invoice-settings', async () => ({
            ok: false,
            code: 'MODULE_NOT_IN_PLAN',
          })),
          { capabilities: { navigate: onNavigate } },
        )}
      />,
    );
    expect(
      await screen.findByTestId('invoice-settings-plan-lock'),
    ).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'View plans' }));
    expect(onNavigate).toHaveBeenCalledWith('/subscription');

    cleanup();
    const retry = settingsSubmit({
      load: vi
        .fn()
        .mockResolvedValueOnce({ ok: false, formError: 'Down' })
        .mockResolvedValue(SETTINGS),
    });
    render(<BillingMfe data={data(feature('invoice-settings', retry))} />);
    expect(
      await screen.findByTestId('invoice-settings-error'),
    ).toHaveTextContent('Down');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByLabelText('Invoice prefix')).toBeTruthy();
  });

  it('keeps staff on a plan lock without an upgrade CTA', async () => {
    render(
      <BillingMfe
        data={data(
          feature(
            'invoice-settings',
            async () => ({ ok: false, code: 'MODULE_NOT_IN_PLAN' }),
            { role: 'pharmacy_staff', canPatchSettings: false },
          ),
        )}
      />,
    );
    expect(
      await screen.findByTestId('invoice-settings-plan-lock'),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'View plans' })).toBeNull();
  });

  it('surfaces a forbidden save without throwing', async () => {
    const user = userEvent.setup();
    const onSubmit = settingsSubmit({
      save: async () => ({ ok: false, code: 'FORBIDDEN', formError: 'No' }),
    });
    render(<BillingMfe data={data(feature('invoice-settings', onSubmit))} />);
    await screen.findByLabelText('Invoice prefix');
    await user.type(screen.getByLabelText('Invoice prefix'), 'Z');
    await user.click(screen.getByRole('button', { name: 'Save settings' }));
    expect(
      await screen.findByTestId('invoice-settings-error'),
    ).toHaveTextContent('No');
  });

  it('keeps the form after a save that returns no settings payload', async () => {
    const user = userEvent.setup();
    const onSubmit = settingsSubmit({
      save: async () => ({ ok: true }),
    });
    render(<BillingMfe data={data(feature('invoice-settings', onSubmit))} />);
    await screen.findByLabelText('Invoice prefix');
    await user.type(screen.getByLabelText('Invoice prefix'), 'Y');
    await user.click(screen.getByRole('button', { name: 'Save settings' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'save'),
      ).toBe(true);
    });
  });

  it('loads empty settings defaults', async () => {
    render(
      <BillingMfe
        data={data(feature('invoice-settings', async () => ({ ok: true })))}
      />,
    );
    expect(await screen.findByLabelText('Invoice prefix')).toHaveValue('');
    expect(screen.getByLabelText('Template')).toHaveValue('MODERN');
  });
});

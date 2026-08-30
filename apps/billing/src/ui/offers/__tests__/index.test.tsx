import type {
  BillingCommand,
  BillingSubmitResult,
} from '@medmate/billing-contract';
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OFFERS_LIST, data, feature } from '../../../app/__tests__/helpers';
import BillingMfe from '../../../app/BillingMfe';

afterEach(() => {
  cleanup();
});

function offersSubmit(
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
        return OFFERS_LIST;
      }
      if (command.action === 'validate') {
        return {
          ok: true,
          offerValidate: { is_valid: true, discount_amount: 42 },
        };
      }
      return { ok: true };
    },
  );
}

describe('OffersScreen', () => {
  it('lists offers, toggles, and validates a coupon', async () => {
    const user = userEvent.setup();
    const onSubmit = offersSubmit();
    render(<BillingMfe data={data(feature('offers', onSubmit))} />);
    expect(await screen.findByTestId('offers-table')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Deactivate offer' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'toggle'),
      ).toBe(true);
    });
    await user.type(screen.getByLabelText('Coupon code'), 'AB12CD');
    await user.type(screen.getByLabelText('Cart total'), '420');
    await user.click(screen.getByRole('button', { name: 'Check coupon' }));
    expect(
      await screen.findByTestId('offer-validate-result'),
    ).toHaveTextContent(/valid/i);
  });

  it('creates an offer and confirms delete', async () => {
    const user = userEvent.setup();
    const onSubmit = offersSubmit();
    render(<BillingMfe data={data(feature('offers', onSubmit))} />);
    await screen.findByTestId('offers-table');
    await user.click(screen.getByRole('button', { name: 'Create offer' }));
    expect(screen.getByTestId('offer-editor')).toBeTruthy();
    await user.type(screen.getByLabelText('Title'), '15% Off');
    await user.type(screen.getByLabelText('Discount value'), '15');
    await user.type(screen.getByLabelText('Valid from'), '2026-08-01');
    await user.type(screen.getByLabelText('Valid until'), '2026-08-31');
    await user.click(screen.getByRole('button', { name: 'Save offer' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'create'),
      ).toBe(true);
    });
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByTestId('offer-delete-dialog')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Confirm delete' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'delete'),
      ).toBe(true);
    });
  });

  it('locks below Growth and hides mutations for staff', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <BillingMfe
        data={data(
          feature('offers', async () => ({
            ok: false,
            code: 'PLAN_FEATURE_LOCKED',
          })),
          { capabilities: { navigate: onNavigate } },
        )}
      />,
    );
    expect(await screen.findByTestId('offers-plan-lock')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'View plans' }));
    expect(onNavigate).toHaveBeenCalledWith('/subscription');

    cleanup();
    render(
      <BillingMfe
        data={data(
          feature('offers', offersSubmit(), {
            role: 'pharmacy_staff',
            canMutateOffers: false,
          }),
        )}
      />,
    );
    await screen.findByTestId('offers-table');
    expect(screen.queryByRole('button', { name: 'Create offer' })).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Deactivate offer' }),
    ).toBeNull();
    expect(screen.getByTestId('offers-readonly')).toBeTruthy();
  });

  it('edits, validates failures, and confirms empty plus retry', async () => {
    const user = userEvent.setup();
    const onSubmit = offersSubmit({
      load: vi
        .fn()
        .mockResolvedValueOnce({ ok: false, formError: 'Down' })
        .mockResolvedValue(OFFERS_LIST),
      validate: async () => ({
        ok: true,
        offerValidate: { is_valid: false, message: 'Not applicable' },
      }),
      patch: async () => ({ ok: true, offer: { offer_id: 'off-1' } }),
    });
    render(<BillingMfe data={data(feature('offers', onSubmit))} />);
    expect(await screen.findByTestId('offers-error')).toHaveTextContent('Down');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByTestId('offers-table');
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const editor = screen.getByTestId('offer-editor');
    expect(editor).toBeTruthy();
    await user.clear(within(editor).getByLabelText('Coupon code'));
    await user.type(within(editor).getByLabelText('Coupon code'), 'EDIT1');
    await user.click(screen.getByRole('button', { name: 'Save offer' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'patch'),
      ).toBe(true);
    });
    await user.click(screen.getByRole('button', { name: 'Check coupon' }));
    expect(await screen.findByTestId('offers-error')).toHaveTextContent(
      /coupon and cart/i,
    );
    await user.type(screen.getByLabelText('Coupon code'), 'AB12CD');
    await user.type(screen.getByLabelText('Cart total'), '100');
    await user.click(screen.getByRole('button', { name: 'Check coupon' }));
    expect(
      await screen.findByTestId('offer-validate-result'),
    ).toHaveTextContent(/not valid/i);

    cleanup();
    const silentInvalid = offersSubmit({
      validate: async () => ({
        ok: true,
        offerValidate: { is_valid: false },
      }),
    });
    render(<BillingMfe data={data(feature('offers', silentInvalid))} />);
    await screen.findByTestId('offers-table');
    await user.type(screen.getByLabelText('Coupon code'), 'AB12CD');
    await user.type(screen.getByLabelText('Cart total'), '10');
    await user.click(screen.getByRole('button', { name: 'Check coupon' }));
    expect(await screen.findByTestId('offer-validate-result')).toHaveTextContent(
      /not valid/i,
    );

    cleanup();
    render(
      <BillingMfe
        data={data(feature('offers', async () => ({ ok: true, offers: [] })))}
      />,
    );
    expect(await screen.findByTestId('offers-empty')).toBeTruthy();

    cleanup();
    const noValidate = offersSubmit({
      validate: async () => ({ ok: true }),
      create: async () => ({ ok: false, formError: 'Save failed' }),
    });
    render(<BillingMfe data={data(feature('offers', noValidate))} />);
    await screen.findByTestId('offers-table');
    await user.type(screen.getByLabelText('Coupon code'), 'AB12CD');
    await user.type(screen.getByLabelText('Cart total'), '10');
    await user.click(screen.getByRole('button', { name: 'Check coupon' }));
    expect(screen.queryByTestId('offer-validate-result')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Create offer' }));
    await user.type(screen.getByLabelText('Title'), 'Fail');
    await user.type(screen.getByLabelText('Discount value'), '5');
    await user.type(screen.getByLabelText('Valid from'), '2026-08-01');
    await user.type(screen.getByLabelText('Valid until'), '2026-08-31');
    await user.click(screen.getByRole('button', { name: 'Save offer' }));
    expect(await screen.findByTestId('offers-error')).toHaveTextContent(
      'Save failed',
    );
  });

  it('covers create validation, inactive toggle, and mutation locks', async () => {
    const user = userEvent.setup();
    const onSubmit = offersSubmit({
      load: async () => ({
        ok: true,
        kpi: {},
        offers: [
          {
            offer_id: 'off-2',
            discount_type: 'FLAT_RS',
            applies_to: 'OTHER',
            is_active: false,
          },
          {
            offer_id: 'off-3',
            title: 'Category',
            coupon_code: 'CAT',
            discount_type: 'PERCENTAGE',
            applies_to: 'CATEGORY',
            max_redemptions: 3,
            is_active: true,
            is_online: true,
            is_counter: false,
          },
        ],
      }),
      toggle: async () => ({ ok: false, formError: 'Cannot toggle' }),
    });
    render(<BillingMfe data={data(feature('offers', onSubmit))} />);
    await screen.findByTestId('offers-table');
    expect(screen.getByTestId('offers-kpi')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Create offer' }));
    await user.click(screen.getByRole('button', { name: 'Save offer' }));
    expect(screen.getByText('Check this field.')).toBeTruthy();
    await user.type(screen.getByLabelText('Title'), 'Dated');
    await user.click(screen.getByRole('button', { name: 'Save offer' }));
    expect(screen.getAllByText('Check this field.').length).toBeGreaterThan(0);
    await user.type(screen.getByLabelText('Discount value'), '5');
    await user.click(screen.getByRole('button', { name: 'Save offer' }));
    expect(screen.getAllByText('Check this field.').length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]!);
    expect(screen.getByTestId('offer-editor')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[1]!);
    expect(screen.getByTestId('offer-editor')).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(screen.queryByTestId('offer-editor')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Activate offer' }));
    expect(await screen.findByTestId('offers-error')).toHaveTextContent(
      'Cannot toggle',
    );
  });

  it('maps create, delete, and validate lock or field errors', async () => {
    const user = userEvent.setup();
    const onSubmit = offersSubmit({
      create: async () => ({
        ok: false,
        fieldErrors: { title: 'Required' },
        formError: 'Check fields',
      }),
      delete: async () => ({ ok: false, formError: 'Cannot delete' }),
      validate: async () => ({ ok: false, formError: 'Bad coupon' }),
    });
    render(<BillingMfe data={data(feature('offers', onSubmit))} />);
    await screen.findByTestId('offers-table');
    await user.click(screen.getByRole('button', { name: 'Create offer' }));
    await user.type(screen.getByLabelText('Title'), 'X');
    await user.type(screen.getByLabelText('Discount value'), '5');
    await user.type(screen.getByLabelText('Valid from'), '2026-08-01');
    await user.type(screen.getByLabelText('Valid until'), '2026-08-31');
    await user.click(screen.getByLabelText('Online storefront'));
    await user.click(screen.getByLabelText('Counter'));
    await user.selectOptions(screen.getByLabelText('Discount type'), 'FLAT_RS');
    await user.selectOptions(screen.getByLabelText('Applies to'), 'PRODUCT');
    await user.type(screen.getByLabelText('Max redemptions'), '10');
    await user.click(screen.getByRole('button', { name: 'Save offer' }));
    expect(await screen.findByTestId('offers-error')).toHaveTextContent(
      'Check fields',
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Confirm delete' }));
    expect(await screen.findByTestId('offers-error')).toHaveTextContent(
      'Cannot delete',
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.type(screen.getByLabelText('Coupon code'), 'X');
    await user.type(screen.getByLabelText('Cart total'), '10');
    await user.click(screen.getByRole('button', { name: 'Check coupon' }));
    expect(await screen.findByTestId('offers-error')).toHaveTextContent(
      'Bad coupon',
    );
  });

  it('locks create, delete, and validate independently', async () => {
    const user = userEvent.setup();
    const createLock = offersSubmit({
      create: async () => ({ ok: false, code: 'PLAN_FEATURE_LOCKED' }),
    });
    render(<BillingMfe data={data(feature('offers', createLock))} />);
    await screen.findByTestId('offers-table');
    await user.selectOptions(screen.getByLabelText('Status'), 'ALL');
    await user.click(screen.getByRole('button', { name: 'Create offer' }));
    await user.type(screen.getByLabelText('Title'), 'Locked');
    await user.type(screen.getByLabelText('Discount value'), '5');
    await user.type(screen.getByLabelText('Valid from'), '2026-08-01');
    await user.type(screen.getByLabelText('Valid until'), '2026-08-31');
    await user.click(screen.getByRole('button', { name: 'Save offer' }));
    expect(await screen.findByTestId('offers-plan-lock')).toBeTruthy();

    cleanup();
    const deleteLock = offersSubmit({
      delete: async () => ({ ok: false, code: 'PLAN_FEATURE_LOCKED' }),
    });
    render(<BillingMfe data={data(feature('offers', deleteLock))} />);
    await screen.findByTestId('offers-table');
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Confirm delete' }));
    expect(await screen.findByTestId('offers-plan-lock')).toBeTruthy();

    cleanup();
    const validateLock = offersSubmit({
      validate: async () => ({ ok: false, code: 'PLAN_FEATURE_LOCKED' }),
    });
    render(<BillingMfe data={data(feature('offers', validateLock))} />);
    await screen.findByTestId('offers-table');
    await user.type(screen.getByLabelText('Coupon code'), 'AB12CD');
    await user.type(screen.getByLabelText('Cart total'), '10');
    await user.click(screen.getByRole('button', { name: 'Check coupon' }));
    expect(await screen.findByTestId('offers-plan-lock')).toBeTruthy();

    cleanup();
    const patchLock = offersSubmit({
      patch: async () => ({ ok: false, code: 'PLAN_FEATURE_LOCKED' }),
    });
    render(<BillingMfe data={data(feature('offers', patchLock))} />);
    await screen.findByTestId('offers-table');
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Save offer' }));
    expect(await screen.findByTestId('offers-plan-lock')).toBeTruthy();

    cleanup();
    const toggleLock = offersSubmit({
      toggle: async () => ({ ok: false, code: 'PLAN_FEATURE_LOCKED' }),
    });
    render(<BillingMfe data={data(feature('offers', toggleLock))} />);
    await screen.findByTestId('offers-table');
    await user.click(screen.getByRole('button', { name: 'Deactivate offer' }));
    expect(await screen.findByTestId('offers-plan-lock')).toBeTruthy();
  });
});

import type {
  SubscriptionCommand,
  SubscriptionSubmitResult,
} from '@medmate/subscription-contract';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature, FREE_LOAD } from '../../../app/__tests__/helpers';
import SubscriptionMfe from '../../../app/SubscriptionMfe';

afterEach(() => {
  cleanup();
});

function plansSubmit(
  load: SubscriptionSubmitResult = FREE_LOAD,
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
        return load;
      }
      return { ok: true, subscription: load.ok ? load.subscription : null };
    },
  );
}

describe('PlansScreen', () => {
  it('maps RETAIL_PRO to Growth and marks the current Starter plan', async () => {
    const onSubmit = plansSubmit({
      ok: true,
      plans: FREE_LOAD.ok ? FREE_LOAD.plans : [],
      subscription: { current_plan: 'STARTER', status: 'TRIAL' },
    });
    render(<SubscriptionMfe data={data(feature('plans', onSubmit))} />);
    await waitFor(() => {
      expect(screen.getByTestId('plan-card-RETAIL_PRO')).toHaveTextContent(
        'Growth',
      );
    });
    expect(screen.getByTestId('plan-card-RETAIL_PRO')).toHaveAttribute(
      'data-plan-name',
      'RETAIL_PRO',
    );
    expect(screen.getByTestId('current-plan-chip')).toHaveTextContent(
      'Starter',
    );
    expect(screen.getByTestId('plan-current-mark')).toHaveTextContent(
      'Current plan',
    );
    expect(screen.getByTestId('trial-badge')).toBeTruthy();
    expect(screen.getByTestId('plan-card-FREE')).toHaveTextContent('Seats: 1');
    expect(screen.getByTestId('plan-card-ENTERPRISE')).toHaveTextContent(
      'Contact us / custom',
    );
    expect(screen.getByTestId('plan-card-CUSTOM')).toHaveTextContent('—');
    expect(screen.queryByText('Hospital')).toBeNull();
    expect(screen.getByTestId('plans-matrix')).toBeTruthy();
    expect(screen.getByTestId('plan-card-STARTER')).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(
      screen.getByTestId('plan-card-RETAIL_PRO').querySelector('button'),
    ).toHaveTextContent('Upgrade');
  });

  it('shows four skeleton cards while loading', async () => {
    let resolveLoad: (value: SubscriptionSubmitResult) => void = () =>
      undefined;
    const pending = new Promise<SubscriptionSubmitResult>((resolve) => {
      resolveLoad = resolve;
    });
    render(
      <SubscriptionMfe data={data(feature('plans', async () => pending))} />,
    );
    expect(screen.getByTestId('plans-skeleton')).toBeTruthy();
    expect(screen.getByLabelText('Loading plans').children).toHaveLength(4);
    resolveLoad(FREE_LOAD);
    await waitFor(() => {
      expect(screen.getByTestId('plans-panel')).toBeTruthy();
    });
  });

  it('hides change controls for staff and shows forbidden copy', async () => {
    const onSubmit = plansSubmit({
      ok: true,
      plans: [],
      plansForbidden: true,
      subscription: { current_plan: 'STARTER' },
    });
    render(
      <SubscriptionMfe
        data={data(
          feature('plans', onSubmit, {
            canWrite: false,
            role: 'pharmacy_staff',
          }),
        )}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('plans-forbidden')).toBeTruthy();
    });
    expect(screen.queryByRole('button', { name: 'Subscribe' })).toBeNull();

    cleanup();
    render(
      <SubscriptionMfe
        data={data(
          feature(
            'plans',
            plansSubmit({
              ok: true,
              plans: [],
              plansForbidden: false,
              subscription: { current_plan: 'STARTER' },
            }),
            { canWrite: false, role: 'pharmacy_staff' },
          ),
        )}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('plans-forbidden')).toBeTruthy();
    });
  });

  it('subscribes with a reused idempotency key and shows Core error codes', async () => {
    const onSubmit = plansSubmit(FREE_LOAD, {
      subscribe: vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          code: 'VALIDATION_ERROR',
          formError: 'Plan unavailable',
        })
        .mockResolvedValueOnce({
          ok: true,
          subscription: { current_plan: 'STARTER' },
        }),
    });
    const user = userEvent.setup();
    render(
      <SubscriptionMfe
        data={data(feature('plans', onSubmit), {
          capabilities: {
            api: {
              request: async <T = unknown,>() => ({
                ok: true,
                status: 200,
                data: {} as T,
              }),
              createIdempotencyKey: () => 'intent-1',
            },
          },
        })}
      />,
    );
    await waitFor(() => {
      expect(
        screen.getByTestId('plan-card-STARTER').querySelector('button'),
      ).toBeTruthy();
    });
    const subscribe = screen
      .getByTestId('plan-card-STARTER')
      .querySelector('button') as HTMLButtonElement;
    await user.click(subscribe);
    await user.click(screen.getByRole('button', { name: 'Subscribe' }));
    await waitFor(() => {
      expect(screen.getByTestId('plans-error')).toHaveTextContent(
        'VALIDATION_ERROR',
      );
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'subscribe',
        values: expect.objectContaining({
          plan_id: 'plan-starter',
          idempotencyKey: 'intent-1',
        }),
      }),
    );
  });

  it('confirms downgrade with next-renewal copy and cancel names Growth', async () => {
    const onSubmit = plansSubmit({
      ok: true,
      plans: FREE_LOAD.ok ? FREE_LOAD.plans : [],
      subscription: { current_plan: 'RETAIL_PRO', status: 'PAST_DUE' },
    });
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <SubscriptionMfe
        data={data(feature('plans', onSubmit), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('past-due-banner')).toBeTruthy();
    });
    await user.click(screen.getByRole('button', { name: 'Go to billing' }));
    expect(onNavigate).toHaveBeenCalledWith('/billing');
    const firstDowngrade = screen.getAllByRole('button', {
      name: 'Downgrade',
    })[0]!;
    await user.click(firstDowngrade);
    expect(screen.getAllByText(/next renewal/).length).toBeGreaterThan(0);
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    const retryDowngrade = screen.getAllByRole('button', {
      name: 'Downgrade',
    })[0]!;
    await user.click(retryDowngrade);
    await user.click(screen.getByRole('button', { name: 'Keep plan' }));
    await user.click(
      screen.getByRole('button', { name: 'Cancel subscription' }),
    );
    expect(screen.getAllByText(/ends Growth modules/).length).toBeGreaterThan(
      0,
    );
  });

  it('shows a load error and an empty catalogue', async () => {
    render(
      <SubscriptionMfe
        data={data(
          feature(
            'plans',
            plansSubmit({
              ok: false,
              code: 'FORBIDDEN',
              formError: 'No catalogue',
            }),
          ),
        )}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('plans-error')).toHaveTextContent('FORBIDDEN');
    });
    cleanup();
    render(
      <SubscriptionMfe
        data={data(
          feature(
            'plans',
            plansSubmit({
              ok: false,
            }),
          ),
        )}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('plans-error')).toHaveTextContent(
        'Unable to load plans.',
      );
    });
    cleanup();
    render(
      <SubscriptionMfe
        data={data(
          feature(
            'plans',
            plansSubmit({
              ok: true,
              subscription: { current_plan: 'STARTER' },
            }),
          ),
        )}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('No plans were returned.')).toBeTruthy();
    });
  });

  it('upgrades, reports auto-renew failure, and cancels', async () => {
    const onSubmit = plansSubmit(
      {
        ok: true,
        plans: FREE_LOAD.ok ? FREE_LOAD.plans : [],
        subscription: { current_plan: 'STARTER', auto_renew: true },
      },
      {
        upgrade: async () => ({
          ok: true,
          subscription: { current_plan: 'RETAIL_PRO' },
          plans: FREE_LOAD.ok ? FREE_LOAD.plans : [],
        }),
        cancel: async () => ({
          ok: true,
          subscription: { current_plan: 'STARTER', status: 'CANCELLED' },
        }),
        autoRenew: async () => ({
          ok: false,
        }),
      },
    );
    const user = userEvent.setup();
    render(<SubscriptionMfe data={data(feature('plans', onSubmit))} />);
    await waitFor(() => {
      expect(
        screen.getByTestId('plan-card-RETAIL_PRO').querySelector('button'),
      ).toBeTruthy();
    });
    await user.click(
      screen.getByTestId('plan-card-RETAIL_PRO').querySelector('button')!,
    );
    await user.click(screen.getByRole('button', { name: 'Upgrade' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'upgrade' }),
      );
    });
    await user.click(screen.getByLabelText('Auto-renew'));
    await waitFor(() => {
      expect(screen.getByTestId('plans-error')).toHaveTextContent(
        'Unable to update auto-renew.',
      );
    });
    await user.click(
      screen.getByRole('button', { name: 'Cancel subscription' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Cancel subscription' }),
    );
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        screen: 'plans',
        action: 'cancel',
      });
    });
  });

  it('confirms a downgrade and labels unknown plan names', async () => {
    const onSubmit = plansSubmit({
      ok: true,
      plans: [
        {
          id: 'plan-custom',
          name: 'HOSPITAL',
          price_monthly_rs: 10,
          price_annual_rs: 100,
        },
        {
          id: 'plan-starter',
          name: 'STARTER',
          price_monthly_rs: 499,
          price_annual_rs: 4990,
        },
      ],
      subscription: { current_plan: 'RETAIL_PRO' },
    });
    const user = userEvent.setup();
    render(<SubscriptionMfe data={data(feature('plans', onSubmit))} />);
    await waitFor(() => {
      expect(screen.getByTestId('plan-card-HOSPITAL')).toHaveTextContent(
        'HOSPITAL',
      );
    });
    await user.click(
      screen.getByTestId('plan-card-STARTER').querySelector('button')!,
    );
    await user.click(screen.getByRole('button', { name: 'Downgrade' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'downgrade' }),
      );
    });
  });

  it('toggles auto-renew from the response', async () => {
    const onSubmit = plansSubmit(FREE_LOAD, {
      autoRenew: async () => ({
        ok: true,
        subscription: { current_plan: 'FREE', auto_renew: false },
      }),
    });
    const user = userEvent.setup();
    render(<SubscriptionMfe data={data(feature('plans', onSubmit))} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Auto-renew')).toBeChecked();
    });
    await user.click(screen.getByLabelText('Auto-renew'));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        screen: 'plans',
        action: 'autoRenew',
        values: { enabled: false },
      });
    });
  });

  it('uses plan fallback labels and subscribe errors without a host key', async () => {
    const onSubmit = plansSubmit(
      {
        ok: true,
        plans: FREE_LOAD.ok ? FREE_LOAD.plans : [],
        subscription: { plan: 'FREE' },
      },
      {
        subscribe: async () => ({ ok: false }),
      },
    );
    const user = userEvent.setup();
    render(<SubscriptionMfe data={data(feature('plans', onSubmit))} />);
    await waitFor(() => {
      expect(screen.getByTestId('current-plan-chip')).toHaveTextContent('Free');
    });
    await user.click(
      screen.getByTestId('plan-card-STARTER').querySelector('button')!,
    );
    await user.click(screen.getByRole('button', { name: 'Subscribe' }));
    await waitFor(() => {
      expect(screen.getByTestId('plans-error')).toHaveTextContent(
        'Unable to change plan.',
      );
    });
  });

  it('keeps auto-renew local when Core omits the subscription', async () => {
    const onSubmit = plansSubmit(FREE_LOAD, {
      autoRenew: async () => ({ ok: true }),
    });
    const user = userEvent.setup();
    render(<SubscriptionMfe data={data(feature('plans', onSubmit))} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Auto-renew')).toBeChecked();
    });
    await user.click(screen.getByLabelText('Auto-renew'));
    await waitFor(() => {
      expect(screen.getByLabelText('Auto-renew')).not.toBeChecked();
    });
  });
});

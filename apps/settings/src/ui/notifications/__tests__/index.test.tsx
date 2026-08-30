import type {
  NotificationPreferencesPayload,
  SettingsCommand,
  SettingsSubmitResult,
} from '@medmate/settings-contract';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature } from '../../../app/__tests__/helpers';
import SettingsMfe from '../../../app/SettingsMfe';

afterEach(() => {
  cleanup();
});

const CORE_PREFS: NotificationPreferencesPayload = {
  pharmacy_id: 'pharm-1',
  channels: {
    push: { enabled: true, can_disable: true },
    sms: { enabled: true, can_disable: true },
    whatsapp: {
      enabled: false,
      can_disable: false,
      status: 'CHANNEL_UNAVAILABLE',
    },
    email: {
      enabled: false,
      can_disable: false,
      status: 'CHANNEL_UNAVAILABLE',
    },
  },
  categories: {
    order_alerts: { enabled: true, can_disable: false },
    settlement_updates: { enabled: true, can_disable: true },
    kyc_updates: { enabled: true, can_disable: false },
    low_stock_alerts: { enabled: true, can_disable: true },
    compliance_reminders: { enabled: true, can_disable: false },
  },
  updated_at: '2026-08-31T00:00:00Z',
};

function prefsSubmit(
  preferences: NotificationPreferencesPayload = CORE_PREFS,
  overrides: Partial<
    Record<SettingsCommand['action'], () => Promise<SettingsSubmitResult>>
  > = {},
) {
  return vi.fn(
    async (command: SettingsCommand): Promise<SettingsSubmitResult> => {
      const override = overrides[command.action];
      if (override) {
        return override();
      }
      if (command.screen === 'notifications' && command.action === 'load') {
        return { ok: true, preferences };
      }
      if (command.screen === 'notifications' && command.action === 'save') {
        return { ok: true, savedPreferences: { updated: true } };
      }
      return { ok: true };
    },
  );
}

describe('NotificationsScreen', () => {
  it('renders only keys Core returned and does not invent digest rows', async () => {
    render(
      <SettingsMfe data={data(feature('notifications', prefsSubmit()))} />,
    );
    expect(
      await screen.findByTestId('settings-notifications-page'),
    ).toBeTruthy();
    expect(screen.getByLabelText('Push')).toBeTruthy();
    expect(screen.getByLabelText('SMS')).toBeTruthy();
    expect(screen.getByLabelText('WhatsApp')).toBeDisabled();
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Order alerts')).toBeDisabled();
    expect(screen.getByLabelText('Low stock alerts')).toBeEnabled();
    expect(screen.queryByLabelText('Digest emails')).toBeNull();
    expect(
      screen.getAllByText('This channel is not available.').length,
    ).toBeGreaterThan(0);
  });

  it('saves the changed snake_case subset then reloads', async () => {
    const user = userEvent.setup();
    const onSubmit = prefsSubmit();
    render(<SettingsMfe data={data(feature('notifications', onSubmit))} />);
    await screen.findByLabelText('SMS');
    await user.click(screen.getByLabelText('SMS'));
    await user.click(screen.getByLabelText('Low stock alerts'));
    await user.click(screen.getByRole('button', { name: 'Save preferences' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        screen: 'notifications',
        action: 'save',
        values: {
          channels: { sms: false },
          categories: { low_stock_alerts: false },
        },
      });
    });
    expect(
      onSubmit.mock.calls.filter((call) => call[0]?.action === 'load').length,
    ).toBeGreaterThan(1);
  });

  it('keeps staff preferences read-only', async () => {
    render(
      <SettingsMfe
        data={data(
          feature('notifications', prefsSubmit(), {
            canWrite: false,
            role: 'pharmacy_staff',
          }),
        )}
      />,
    );
    await screen.findByLabelText('SMS');
    expect(screen.getByLabelText('SMS')).toBeDisabled();
    expect(screen.getByLabelText('Push')).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Save preferences' }),
    ).toBeNull();
    expect(screen.getByTestId('notifications-staff')).toBeTruthy();
  });

  it('shows field details when save fails', async () => {
    const user = userEvent.setup();
    const onSubmit = prefsSubmit(CORE_PREFS, {
      save: async () => ({
        ok: false,
        code: 'VALIDATION_ERROR',
        formError: 'Check the highlighted fields and try again.',
        fieldErrors: { sms: 'SMS cannot be disabled today.' },
      }),
    });
    render(<SettingsMfe data={data(feature('notifications', onSubmit))} />);
    await screen.findByLabelText('SMS');
    await user.click(screen.getByLabelText('SMS'));
    await user.click(screen.getByRole('button', { name: 'Save preferences' }));
    expect(
      await screen.findByText('SMS cannot be disabled today.'),
    ).toBeTruthy();
    expect(screen.getByTestId('notifications-error')).toHaveTextContent(
      'Check the highlighted fields and try again.',
    );
  });

  it('confirms before leaving with unsaved changes', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <SettingsMfe
        data={{
          ...data(feature('notifications', prefsSubmit())),
          capabilities: { navigate: onNavigate },
        }}
      />,
    );
    await screen.findByLabelText('SMS');
    await user.click(screen.getByLabelText('SMS'));
    const link = document.createElement('a');
    link.setAttribute('href', '/settings/profile');
    link.textContent = 'Profile';
    document.body.appendChild(link);
    await user.click(link);
    expect(
      screen.getByRole('heading', { name: 'Leave without saving?' }),
    ).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Stay' }));
    expect(onNavigate).not.toHaveBeenCalled();
    link.remove();
  });

  it('does not invent WhatsApp when Core omitted it', async () => {
    render(
      <SettingsMfe
        data={data(
          feature(
            'notifications',
            prefsSubmit({
              channels: {
                push: { enabled: true, can_disable: true },
              },
              categories: {
                order_alerts: { enabled: true, can_disable: false },
              },
            }),
          ),
        )}
      />,
    );
    await screen.findByLabelText('Push');
    expect(screen.queryByLabelText('WhatsApp')).toBeNull();
    expect(screen.queryByLabelText('Email')).toBeNull();
  });

  it('saves when only channels are returned', async () => {
    const user = userEvent.setup();
    const onSubmit = prefsSubmit({
      channels: {
        push: { enabled: true, can_disable: true },
        sms: { enabled: true, can_disable: true },
      },
      categories: {},
    });
    render(<SettingsMfe data={data(feature('notifications', onSubmit))} />);
    await screen.findByLabelText('SMS');
    await user.click(screen.getByLabelText('SMS'));
    await user.click(screen.getByRole('button', { name: 'Save preferences' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        screen: 'notifications',
        action: 'save',
        values: { channels: { sms: false }, categories: undefined },
      });
    });
  });

  it('disables writes and shows a code-only save error', async () => {
    const user = userEvent.setup();
    render(
      <SettingsMfe
        data={data(feature('notifications', prefsSubmit(), { disabled: true }))}
      />,
    );
    await screen.findByLabelText('SMS');
    expect(screen.getByLabelText('SMS')).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Save preferences' }),
    ).toBeDisabled();
    cleanup();
    const onSubmit = prefsSubmit(CORE_PREFS, {
      save: async () => ({ ok: false }),
    });
    render(<SettingsMfe data={data(feature('notifications', onSubmit))} />);
    await screen.findByLabelText('SMS');
    await user.click(screen.getByLabelText('SMS'));
    await user.click(screen.getByRole('button', { name: 'Save preferences' }));
    expect(await screen.findByTestId('notifications-error')).toHaveTextContent(
      'You do not have permission to do that.',
    );
  });

  it('shows empty and load error states', async () => {
    const { rerender } = render(
      <SettingsMfe
        data={data(
          feature(
            'notifications',
            prefsSubmit({ channels: {}, categories: {} }),
          ),
        )}
      />,
    );
    expect(await screen.findByTestId('notifications-empty')).toBeTruthy();
    rerender(
      <SettingsMfe
        data={data(
          feature(
            'notifications',
            prefsSubmit(CORE_PREFS, {
              load: async () => ({ ok: true }),
            }),
          ),
        )}
      />,
    );
    expect(await screen.findByTestId('notifications-empty')).toBeTruthy();
    rerender(
      <SettingsMfe
        data={data(
          feature(
            'notifications',
            prefsSubmit(CORE_PREFS, {
              load: async () => ({
                ok: false,
                formError: 'Unable to load notification preferences.',
              }),
            }),
          ),
        )}
      />,
    );
    expect(await screen.findByTestId('notifications-error')).toBeTruthy();
    rerender(
      <SettingsMfe
        data={data(
          feature(
            'notifications',
            prefsSubmit(CORE_PREFS, {
              load: async () => ({ ok: false, code: 'UNAUTHORIZED' }),
            }),
          ),
        )}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('notifications-error')).toHaveTextContent(
        'UNAUTHORIZED',
      );
    });
    rerender(
      <SettingsMfe
        data={data(
          feature(
            'notifications',
            prefsSubmit(CORE_PREFS, {
              load: async () => ({ ok: false }),
            }),
          ),
        )}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('notifications-error')).toHaveTextContent(
        'Unable to load notification preferences.',
      );
    });
  });
});

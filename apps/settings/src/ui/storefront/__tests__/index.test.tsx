import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature } from '../../../app/__tests__/helpers';
import SettingsMfe from '../../../app/SettingsMfe';

afterEach(() => {
  cleanup();
});

describe('StorefrontScreen', () => {
  it('patches online and confirms offline', async () => {
    const user = userEvent.setup();
    const emit = vi.fn();
    const onSubmit = vi.fn(async () => ({ ok: true as const }));
    render(
      <SettingsMfe
        data={{
          ...data(
            feature('storefront', onSubmit, {
              isOnline: true,
              pharmacyName: 'Sri Rama Medicals',
            }),
          ),
          capabilities: {
            events: { emit, on: () => () => undefined },
          },
        }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Set shop online' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        screen: 'storefront',
        action: 'save',
        values: { is_online: true },
      });
    });
    await user.click(screen.getByRole('button', { name: 'Set shop offline' }));
    expect(
      screen.getByRole('heading', { name: 'Take Sri Rama Medicals offline?' }),
    ).toBeTruthy();
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Set shop offline' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Set shop offline' }));
    await user.click(screen.getByRole('button', { name: 'Take offline' }));
    expect(emit).toHaveBeenCalledWith(
      'pharmacy.storefront',
      expect.objectContaining({ is_online: false }),
    );
  });

  it('locks on admin override and suspended', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => ({
      ok: false as const,
      code: 'ADMIN_OVERRIDE_ACTIVE',
      formError: 'Admin has forced this pharmacy offline; contact support',
    }));
    const { rerender } = render(
      <SettingsMfe
        data={data(
          feature('storefront', onSubmit, {
            isOnline: false,
            adminForcedOffline: true,
          }),
        )}
      />,
    );
    expect(screen.getByTestId('storefront-override')).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Forced offline' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Set shop online' }),
    ).toBeDisabled();
    rerender(
      <SettingsMfe
        data={data(
          feature('storefront', onSubmit, {
            isOnline: false,
            adminForcedOffline: false,
            pharmacyStatus: 'SUSPENDED',
          }),
        )}
      />,
    );
    expect(screen.getByTestId('storefront-suspended')).toBeTruthy();
    rerender(
      <SettingsMfe
        data={data(
          feature('storefront', onSubmit, {
            canWrite: true,
            isOnline: null,
            adminForcedOffline: false,
          }),
        )}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Set shop online' }));
    await waitFor(() => {
      expect(screen.getByTestId('storefront-override')).toBeTruthy();
    });
  });

  it('locks after a live admin override response', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => ({
      ok: false as const,
      code: 'ADMIN_OVERRIDE_ACTIVE',
    }));
    render(
      <SettingsMfe
        data={data(
          feature('storefront', onSubmit, {
            isOnline: false,
            adminForcedOffline: false,
          }),
        )}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Set shop online' }));
    await waitFor(() => {
      expect(screen.getByTestId('storefront-override')).toBeTruthy();
    });
    expect(
      screen.getByRole('button', { name: 'Set shop online' }),
    ).toBeDisabled();
  });

  it('is read-only for staff', () => {
    render(
      <SettingsMfe
        data={data(
          feature('storefront', async () => ({ ok: true }), {
            canWrite: false,
            role: 'pharmacy_staff',
            isOnline: true,
          }),
        )}
      />,
    );
    expect(
      screen.queryByRole('button', { name: 'Set shop online' }),
    ).toBeNull();
    expect(screen.getByText(/Staff can view storefront status/)).toBeTruthy();
  });

  it('locks named actions when the host disables writes', () => {
    render(
      <SettingsMfe
        data={data(
          feature('storefront', async () => ({ ok: true }), {
            disabled: true,
            isOnline: true,
          }),
        )}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Set shop online' }),
    ).toBeDisabled();
  });

  it('emits storefront payload from the host result', async () => {
    const user = userEvent.setup();
    const emit = vi.fn();
    const onSubmit = vi.fn(async () => ({
      ok: true as const,
      storefront: { is_online: true, admin_forced_offline: false },
    }));
    render(
      <SettingsMfe
        data={{
          ...data(feature('storefront', onSubmit, { isOnline: false })),
          capabilities: {
            events: { emit, on: () => () => undefined },
          },
        }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Set shop online' }));
    await waitFor(() => {
      expect(emit).toHaveBeenCalledWith('pharmacy.storefront', {
        is_online: true,
        admin_forced_offline: false,
      });
    });
  });

  it('shows a form error without a code', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => ({ ok: false as const }));
    render(
      <SettingsMfe
        data={data(
          feature('storefront', onSubmit, {
            isOnline: true,
            formError: 'Host banner',
          }),
        )}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Set shop online' }));
    await waitFor(() => {
      expect(screen.getByText('Unable to update storefront.')).toBeTruthy();
    });
  });
});

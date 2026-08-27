import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import type { SettingsScreen } from '@medmate/settings-contract';
import { createMfeEnvelope } from '@medmate/test-utils';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SettingsLayout } from '../../layouts/SettingsLayout';
import SettingsMfe from '../SettingsMfe';
import { data, feature, ownerProfileLoad } from './helpers';

afterEach(() => {
  cleanup();
});

describe('SettingsMfe', () => {
  it('shows a contract error without a screen', () => {
    render(
      <SettingsMfe
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: { title: 'x' } as never,
        }}
      />,
    );
    expect(screen.getByTestId('settings-contract-error')).toBeTruthy();
  });
});

describe('SettingsLayout', () => {
  it('renders unknown screens', () => {
    render(
      <SettingsLayout
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: {
            screen: 'nope' as SettingsScreen,
            onSubmit: async () => ({ ok: true }),
          },
        }}
      />,
    );
    expect(screen.getByText('Unknown settings screen.')).toBeTruthy();
  });

  it('routes profile and storefront layouts', async () => {
    const onSubmit = vi.fn(async (command: { action: string }) => {
      if (command.action === 'load') {
        return ownerProfileLoad;
      }
      if (command.action === 'loadCompleteness') {
        return {
          ok: true as const,
          completeness: { completeness_pct: 80, missing_fields: [] },
        };
      }
      if (command.action === 'loadBank') {
        return { ok: true as const, bank: null };
      }
      return { ok: true as const };
    });
    const { rerender } = render(
      <SettingsMfe data={data(feature('profile', onSubmit))} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('settings-profile-page')).toBeTruthy();
    });
    rerender(
      <SettingsMfe
        data={data(
          feature('storefront', async () => ({ ok: true }), {
            isOnline: true,
          }),
        )}
      />,
    );
    expect(screen.getByTestId('settings-storefront-page')).toBeTruthy();
    rerender(
      <SettingsMfe
        data={createMfeEnvelope({
          feature: feature('storefront', async () => ({ ok: true }), {
            pharmacyName: undefined,
          }),
          context: {
            hostId: 'test-host',
            locale: 'en-IN',
            permissions: [],
            pharmacyId: '',
          },
        })}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Set shop offline' }));
    expect(
      screen.getByRole('heading', { name: 'Take this pharmacy offline?' }),
    ).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    rerender(
      <SettingsMfe
        data={createMfeEnvelope({
          feature: feature('storefront', async () => ({ ok: true }), {
            pharmacyName: undefined,
          }),
          context: {
            hostId: 'test-host',
            locale: 'en-IN',
            permissions: [],
            pharmacyId: 'pharm-1',
          },
        })}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Set shop offline' }));
    expect(
      screen.getByRole('heading', { name: 'Take pharm-1 offline?' }),
    ).toBeTruthy();
  });
});

/**
 * Standalone harness — shared mfe-kit bootstrap only.
 */
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { mountStandalone, StandaloneShell } from '@medmate/mfe-kit';
import {
  SETTINGS_SCREENS,
  isSettingsScreen,
  type CompletenessPayload,
  type ProfilePayload,
  type SettingsFeatureData,
  type SettingsScreen,
  type SettingsSubmitResult,
} from '@medmate/settings-contract';
import { Button, Inline, StatusMessage } from '@medmate/ui';
import { useMemo, useState } from 'react';
import SettingsMfe from '../app/SettingsMfe';
import type { SettingsMfeProps } from '../contract';
import '@medmate/ui/styles.css';

const PROFILE: ProfilePayload = {
  pharmacy_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  business_name: 'Sri Rama Medicals',
  tagline: 'Your neighbourhood pharmacy',
  logo_url: '',
  phone: '+919876543210',
  email: 'priya@srirama.in',
  address: {
    flat: '12',
    area: 'MG Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
  },
  operating_hours: [
    {
      day_of_week: 0,
      day_name: 'Monday',
      open_time: '09:00',
      close_time: '21:00',
      is_closed: false,
    },
  ],
  tax: {
    gstin: '29AABPP1234F1Z5',
    pan_number: 'AABPP1234F',
    is_gst_registered: true,
  },
  status: 'ACTIVE',
  profile_completeness_pct: 80,
};

const COMPLETENESS: CompletenessPayload = {
  completeness_pct: 80,
  missing_fields: [
    {
      field: 'logo_url',
      label: 'Pharmacy Logo',
      impact_pct: 8,
      action: 'Upload your pharmacy logo',
    },
    { field: 'bank_account', label: 'Bank account', impact_pct: 8 },
  ],
  completed_fields: ['business_name', 'phone'],
};

function readScreen(): SettingsScreen {
  if (typeof window === 'undefined') {
    return 'profile';
  }
  const value = new URLSearchParams(window.location.search).get('screen');
  return isSettingsScreen(value) ? value : 'profile';
}

async function mockSubmit(
  screen: SettingsScreen,
  action: string,
): Promise<SettingsSubmitResult> {
  if (screen === 'profile' && action === 'load') {
    return { ok: true, profile: PROFILE };
  }
  if (screen === 'profile' && action === 'loadCompleteness') {
    return { ok: true, completeness: COMPLETENESS };
  }
  if (screen === 'profile' && action === 'loadBank') {
    return {
      ok: true,
      bank: {
        account_holder: 'Sri Rama Medicals',
        bank_name: 'HDFC Bank',
        account_number_masked: 'XXXXXXXXXXXX4321',
        ifsc_code: 'HDFC0001234',
        account_type: 'CURRENT',
        verification_status: 'VERIFIED',
      },
    };
  }
  if (screen === 'profile' && action === 'uploadLogo') {
    return {
      ok: true,
      profile: { logo_url: 'https://cdn.example/shop.png' },
    };
  }
  if (screen === 'storefront') {
    return {
      ok: true,
      storefront: { is_online: false, admin_forced_offline: false },
    };
  }
  return { ok: true };
}

function StandaloneHarness() {
  const [screen, setScreen] = useState<SettingsScreen>(readScreen);
  const [log, setLog] = useState('Ready');

  const feature = useMemo<SettingsFeatureData>(
    () => ({
      screen,
      canWrite: true,
      role: 'pharmacy_owner',
      pharmacyName: 'Sri Rama Medicals',
      pharmacyStatus: 'ACTIVE',
      isOnline: true,
      adminForcedOffline: false,
      onSubmit: async (command) => {
        setLog(`${command.screen}:${command.action}`);
        return mockSubmit(command.screen, command.action);
      },
    }),
    [screen],
  );

  const data = useMemo<SettingsMfeProps['data']>(
    () => ({
      contractVersion: MFE_CONTRACT_VERSION,
      context: {
        hostId: 'settings-standalone',
        locale: 'en-IN',
        permissions: [],
        pharmacyId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      },
      feature,
      capabilities: {
        navigate: (path) => setLog(`navigate:${path}`),
        events: {
          emit: (event) => setLog(`event:${event}`),
          on: () => () => undefined,
        },
      },
    }),
    [feature],
  );

  return (
    <StandaloneShell
      title="Settings standalone harness"
      description="Preview profile and storefront. Hosts pass screen and onSubmit via data.feature."
      className="max-w-5xl"
    >
      <Inline wrap className="mb-4">
        {SETTINGS_SCREENS.map((type) => (
          <Button
            key={type}
            type="button"
            variant={type === screen ? 'primary' : 'ghost'}
            onClick={() => setScreen(type)}
          >
            {type}
          </Button>
        ))}
      </Inline>
      <SettingsMfe data={data} />
      <StatusMessage>{log}</StatusMessage>
    </StandaloneShell>
  );
}

mountStandalone(<StandaloneHarness />);

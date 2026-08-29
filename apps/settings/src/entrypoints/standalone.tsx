/**
 * Standalone harness — shared mfe-kit bootstrap only.
 */
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { mountStandalone, StandaloneShell } from '@medmate/mfe-kit';
import {
  SETTINGS_SCREENS,
  isSettingsScreen,
  type CompletenessPayload,
  type PharmacyRoleRow,
  type ProfilePayload,
  type RolePermissionsPayload,
  type SettingsCommand,
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

const ROLES: PharmacyRoleRow[] = [
  {
    id: 'system-owner',
    name: 'owner',
    display_name: 'Pharmacy Owner',
    is_system: true,
    pharmacy_id: null,
    permissions: ['*'],
    staff_count: 1,
  },
  {
    id: 'system-pharmacist',
    name: 'pharmacist',
    display_name: 'Pharmacist',
    is_system: true,
    pharmacy_id: null,
    permissions: ['orders:fulfill', 'inventory:read', 'prescriptions:verify'],
    staff_count: 0,
  },
  {
    id: 'custom-night',
    name: 'night_shift',
    display_name: 'Night Shift',
    is_system: false,
    pharmacy_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    permissions: ['orders:read'],
    staff_count: 2,
  },
];

const OWNER_PERMISSIONS: RolePermissionsPayload = {
  role_id: 'system-owner',
  role_name: 'owner',
  is_system: true,
  permissions: [
    { permission: 'reports:read', resource: 'reports', action: 'read' },
    { permission: 'staff:manage', resource: 'staff', action: 'manage' },
  ],
};

const PHARMACIST_PERMISSIONS: RolePermissionsPayload = {
  role_id: 'system-pharmacist',
  role_name: 'pharmacist',
  is_system: true,
  permissions: [
    { permission: 'orders:fulfill', resource: 'orders', action: 'fulfill' },
    { permission: 'inventory:read', resource: 'inventory', action: 'read' },
    {
      permission: 'prescriptions:verify',
      resource: 'prescriptions',
      action: 'verify',
    },
  ],
};

const NIGHT_PERMISSIONS: RolePermissionsPayload = {
  role_id: 'custom-night',
  role_name: 'night_shift',
  is_system: false,
  permissions: [
    { permission: 'orders:read', resource: 'orders', action: 'read' },
    { permission: 'orders:fulfill', resource: 'orders', action: 'fulfill' },
    { permission: 'inventory:write', resource: 'inventory', action: 'write' },
  ],
};

function readScreen(): SettingsScreen {
  if (typeof window === 'undefined') {
    return 'profile';
  }
  const value = new URLSearchParams(window.location.search).get('screen');
  return isSettingsScreen(value) ? value : 'profile';
}

async function mockSubmit(
  command: SettingsCommand,
): Promise<SettingsSubmitResult> {
  if (command.screen === 'profile' && command.action === 'load') {
    return { ok: true, profile: PROFILE };
  }
  if (command.screen === 'profile' && command.action === 'loadCompleteness') {
    return { ok: true, completeness: COMPLETENESS };
  }
  if (command.screen === 'profile' && command.action === 'loadBank') {
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
  if (command.screen === 'profile' && command.action === 'uploadLogo') {
    return {
      ok: true,
      profile: { logo_url: 'https://cdn.example/shop.png' },
    };
  }
  if (command.screen === 'storefront') {
    return {
      ok: true,
      storefront: { is_online: false, admin_forced_offline: false },
    };
  }
  if (command.screen === 'roles' && command.action === 'load') {
    return { ok: true, roles: ROLES };
  }
  if (command.screen === 'roles' && command.action === 'loadPermissions') {
    if (command.values.id === 'custom-night') {
      return { ok: true, rolePermissions: NIGHT_PERMISSIONS };
    }
    if (command.values.id === 'system-pharmacist') {
      return { ok: true, rolePermissions: PHARMACIST_PERMISSIONS };
    }
    return { ok: true, rolePermissions: OWNER_PERMISSIONS };
  }
  if (command.screen === 'roles' && command.action === 'create') {
    return {
      ok: true,
      createdRole: {
        id: 'custom-1',
        name: command.values.name,
        display_name: command.values.display_name,
        is_system: false,
        permissions: command.values.permissions,
      },
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
      canEditPermissions: true,
      role: 'pharmacy_owner',
      pharmacyName: 'Sri Rama Medicals',
      pharmacyStatus: 'ACTIVE',
      isOnline: true,
      adminForcedOffline: false,
      onSubmit: async (command) => {
        setLog(`${command.screen}:${command.action}`);
        return mockSubmit(command);
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
      description="Preview profile, storefront, and roles. Hosts pass screen and onSubmit via data.feature."
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

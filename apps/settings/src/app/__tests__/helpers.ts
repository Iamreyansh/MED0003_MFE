import type {
  SettingsFeatureData,
  SettingsScreen,
  SettingsSubmitResult,
} from '@medmate/settings-contract';
import { createMfeEnvelope } from '@medmate/test-utils';

export function feature(
  screen: SettingsScreen,
  onSubmit: SettingsFeatureData['onSubmit'] = async () => ({ ok: true }),
  extra: Partial<SettingsFeatureData> = {},
): SettingsFeatureData {
  return {
    screen,
    onSubmit,
    canWrite: true,
    canEditPermissions: true,
    role: 'pharmacy_owner',
    pharmacyName: 'Sri Rama Medicals',
    pharmacyStatus: 'ACTIVE',
    ...extra,
  };
}

export function data(next: SettingsFeatureData) {
  return createMfeEnvelope({
    feature: next,
    context: { hostId: 'test-host', locale: 'en-IN', permissions: [] },
  });
}

export const ownerProfileLoad: SettingsSubmitResult = {
  ok: true,
  profile: {
    business_name: 'Sri Rama Medicals',
    tagline: '',
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
        open_time: '09:00',
        close_time: '21:00',
        is_closed: false,
      },
      { day_of_week: 99, is_closed: true },
    ],
    tax: { gstin: '29AABPP1234F1Z5', is_gst_registered: true },
    status: 'ACTIVE',
    profile_completeness_pct: 80,
  },
};

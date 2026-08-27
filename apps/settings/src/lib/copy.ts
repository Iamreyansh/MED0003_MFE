import type { SettingsScreen } from '@medmate/settings-contract';

export const SCREEN_COPY: Record<
  SettingsScreen,
  { title: string; helper: string }
> = {
  profile: {
    title: 'Pharmacy profile',
    helper: 'Identity, hours, tax, and settlement details for this shop.',
  },
  storefront: {
    title: 'Storefront',
    helper: 'Control whether customers can find this shop on the marketplace.',
  },
};

export function rootTestId(screen: SettingsScreen): string {
  return screen === 'profile'
    ? 'settings-profile-page'
    : 'settings-storefront-page';
}

export const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const KYC_PENDING_STATUSES = new Set(['PENDING_KYC', 'KYC_SUBMITTED']);

export const PROFILE_NAV = [
  { id: 'section-completeness', label: 'Completeness' },
  { id: 'section-identity', label: 'Identity' },
  { id: 'section-contact', label: 'Contact' },
  { id: 'section-address', label: 'Address' },
  { id: 'section-hours', label: 'Hours' },
  { id: 'section-tax', label: 'Tax' },
  { id: 'section-bank', label: 'Bank' },
  { id: 'section-verify', label: 'Verify' },
] as const;

const PHARMACY_STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Active',
  PENDING_KYC: 'KYC pending',
  KYC_SUBMITTED: 'KYC submitted',
  SUSPENDED: 'Suspended',
};

export function profileStatusLabel(
  status?: string | null,
): string | undefined {
  if (!status) {
    return undefined;
  }
  return PHARMACY_STATUS_LABEL[status] ?? status;
}

export function storefrontStatusLabel({
  pharmacyStatus,
  adminForcedOffline,
  isOnline,
}: {
  pharmacyStatus?: string | null;
  adminForcedOffline?: boolean;
  isOnline?: boolean | null;
}): string {
  if (pharmacyStatus === 'SUSPENDED') {
    return 'Suspended';
  }
  if (adminForcedOffline) {
    return 'Forced offline';
  }
  if (isOnline === true) {
    return 'Online';
  }
  if (isOnline === false) {
    return 'Offline';
  }
  return 'Unknown';
}

export const SAVE_COPY = {
  profile: 'Profile saved',
  tax: 'Tax details saved',
  bank: 'Bank account saved',
  verify: 'Contact verified',
  logo: 'Logo uploaded',
} as const;

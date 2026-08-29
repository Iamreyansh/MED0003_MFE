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
  roles: {
    title: 'Roles',
    helper: 'Define custom permission packs. System roles stay read-only.',
  },
};

export function rootTestId(screen: SettingsScreen): string {
  return `settings-${screen}-page`;
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

export function profileStatusLabel(status?: string | null): string | undefined {
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

export const ROLES_COPY = {
  listHelper: 'System roles stay in the list. Custom packs are pharmacy-owned.',
  staffView: 'Staff can view roles. Only the owner can create or delete them.',
  emptyCustom:
    'No custom roles yet. Create a pack for cashiers or pharmacists.',
  kpiSystem: 'System roles',
  kpiCustom: 'Custom packs',
  kpiAssigned: 'Staff assigned',
  sectionTitle: 'Permission packs',
  sectionHint:
    'System packs stay read-only. Custom packs belong to this pharmacy.',
  typeSystem: 'System',
  typeCustom: 'Custom',
  viewPermissions: 'View permissions',
  editPermissions: 'Edit permissions',
  createRole: 'Create role',
  deleteRole: 'Delete',
  unsaved: 'Unsaved changes',
  matrixTitle: 'Permissions',
  matrixHint: 'Toggle only the permissions Core returned for this role.',
  matrixSystemHint: 'System roles cannot be changed.',
  matrixReadOnlySystem: 'This system role is read-only.',
  matrixReadOnlyStaff:
    'You can view permissions. Only owners or staff with staff manage can save changes.',
  savePermissions: 'Save permissions',
  back: 'Back to roles',
  planLock: 'Roles are not included in this plan.',
  planLockStaff: ' Ask the pharmacy owner to upgrade.',
  viewPlans: 'View plans',
  forbidden: 'You do not have permission to do that.',
  dirtyLeave: 'Permission changes have not been saved.',
  tableLabel: 'Pharmacy roles',
} as const;

export function assignedStaffLabel(count: number): string {
  return `${count} staff`;
}

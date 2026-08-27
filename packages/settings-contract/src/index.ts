export const SETTINGS_SCREENS = ['profile', 'storefront'] as const;

export type SettingsScreen = (typeof SETTINGS_SCREENS)[number];

export const STOREFRONT_EVENT = 'pharmacy.storefront';

export type PharmacyRole = 'pharmacy_owner' | 'pharmacy_staff';

export type ProfileAddress = {
  flat?: string | null;
  area?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type OperatingHour = {
  day_of_week: number;
  day_name?: string;
  open_time?: string | null;
  close_time?: string | null;
  is_closed: boolean;
};

export type ProfileTax = {
  gstin?: string | null;
  pan_number?: string | null;
  drug_licence_number?: string | null;
  fssai_number?: string | null;
  is_gst_registered?: boolean | null;
  e_invoicing_enabled?: boolean | null;
  tds_applicable?: boolean | null;
  tcs_applicable?: boolean | null;
  registered_pharmacist_name?: string | null;
};

export type BankSummary = {
  bank_account_id?: string;
  account_holder?: string | null;
  bank_name?: string | null;
  account_number_masked?: string | null;
  ifsc_code?: string | null;
  account_type?: string | null;
  verification_status?: string | null;
  verified_at?: string | null;
  penny_drop_reference?: string | null;
  penny_drop_initiated?: boolean;
  estimated_verification_hours?: number;
  message?: string;
};

export type ProfilePayload = {
  pharmacy_id?: string;
  code?: string;
  business_name?: string | null;
  tagline?: string | null;
  logo_url?: string | null;
  phone?: string | null;
  email?: string | null;
  business_type?: string | null;
  address?: ProfileAddress | null;
  operating_hours?: OperatingHour[] | null;
  tax?: ProfileTax | null;
  bank_account?: BankSummary | null;
  profile_completeness_pct?: number | null;
  status?: string | null;
  plan?: string | null;
  is_online?: boolean | null;
  admin_forced_offline?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ProfilePatchValues = {
  business_name?: string;
  tagline?: string;
  logo_url?: string;
  phone?: string;
  email?: string;
  address?: ProfileAddress;
  operating_hours?: OperatingHour[];
};

export type ProfileSavePayload = {
  pharmacy_id?: string;
  updated_fields?: string[];
  pending_approval_fields?: string[];
  pending_verification_fields?: string[];
  profile_completeness_pct?: number;
  message?: string;
};

export type CompletenessMissingField = {
  field: string;
  label: string;
  impact_pct?: number;
  action?: string;
};

export type CompletenessPayload = {
  pharmacy_id?: string;
  completeness_pct?: number;
  missing_fields?: CompletenessMissingField[];
  completed_fields?: string[];
};

export type TaxPatchValues = {
  gstin?: string;
  pan_number?: string;
  drug_licence_number?: string;
  fssai_number?: string;
  is_gst_registered?: boolean;
  e_invoicing_enabled?: boolean;
  tds_applicable?: boolean;
  tcs_applicable?: boolean;
  registered_pharmacist_name?: string;
};

export type BankPostValues = {
  account_holder: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_type: 'CURRENT' | 'SAVINGS';
};

export type VerifyContactValues = {
  channel: 'PHONE' | 'EMAIL';
  otp: string;
};

export type StorefrontPayload = {
  pharmacy_id?: string;
  is_online?: boolean;
  admin_forced_offline?: boolean;
  changed_at?: string;
};

export type SettingsCommand =
  | { screen: 'profile'; action: 'load' }
  | { screen: 'profile'; action: 'save'; values: ProfilePatchValues }
  | { screen: 'profile'; action: 'loadCompleteness' }
  | { screen: 'profile'; action: 'saveTax'; values: TaxPatchValues }
  | { screen: 'profile'; action: 'loadBank' }
  | { screen: 'profile'; action: 'saveBank'; values: BankPostValues }
  | { screen: 'profile'; action: 'verifyContact'; values: VerifyContactValues }
  | {
      screen: 'profile';
      action: 'uploadLogo';
      values: { file: File };
    }
  | { screen: 'storefront'; action: 'save'; values: { is_online: boolean } };

export type SettingsSubmitSuccess = {
  ok: true;
  profile?: ProfilePayload;
  save?: ProfileSavePayload;
  completeness?: CompletenessPayload;
  tax?: Record<string, unknown>;
  bank?: BankSummary | null;
  contact?: Record<string, unknown>;
  storefront?: StorefrontPayload;
};

export type SettingsSubmitFailure = {
  ok: false;
  fieldErrors?: Record<string, string>;
  formError?: string;
  code?: string;
};

export type SettingsSubmitResult = SettingsSubmitSuccess | SettingsSubmitFailure;

export type SettingsFeatureData = {
  screen: SettingsScreen;
  onSubmit: (command: SettingsCommand) => Promise<SettingsSubmitResult>;
  role?: PharmacyRole | null;
  canWrite?: boolean;
  pharmacyName?: string;
  pharmacyStatus?: string | null;
  isOnline?: boolean | null;
  adminForcedOffline?: boolean;
  errors?: Record<string, string>;
  formError?: string;
  busy?: boolean;
  disabled?: boolean;
};

export function isSettingsScreen(value: unknown): value is SettingsScreen {
  return (
    typeof value === 'string' &&
    (SETTINGS_SCREENS as readonly string[]).includes(value)
  );
}

export function isSettingsFeatureData(
  value: unknown,
): value is SettingsFeatureData {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const feature = value as Partial<SettingsFeatureData>;
  return (
    isSettingsScreen(feature.screen) && typeof feature.onSubmit === 'function'
  );
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidPhone(value: string): boolean {
  return /^\+91[6-9]\d{9}$/.test(value);
}

export function isValidOtp(value: string): boolean {
  return /^\d{6}$/.test(value);
}

export function isValidPincode(value: string): boolean {
  return /^[1-9][0-9]{5}$/.test(value);
}

export function isValidPan(value: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value);
}

export function isValidGstin(value: string): boolean {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/.test(value);
}

export function isValidFssai(value: string): boolean {
  return /^[0-9]{14}$/.test(value);
}

export function isValidIfsc(value: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value);
}

export function isValidAccountNumber(value: string): boolean {
  return /^[0-9]{9,18}$/.test(value);
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function normalizePhone(raw: string): string {
  return raw.trim().replace(/\s+/g, '');
}

export const COMPLETENESS_SECTION: Record<string, string> = {
  business_name: 'identity',
  tagline: 'identity',
  logo_url: 'identity',
  phone: 'contact',
  email: 'contact',
  address: 'address',
  operating_hours: 'hours',
  gstin: 'tax',
  pan_number: 'tax',
  drug_licence_number: 'tax',
  fssai_number: 'tax',
  registered_pharmacist_name: 'tax',
  bank_account: 'bank',
};

export function completenessSectionId(field: string): string {
  const section = COMPLETENESS_SECTION[field] ?? 'identity';
  return `section-${section}`;
}

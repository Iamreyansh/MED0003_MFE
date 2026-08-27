export const ONBOARDING_SCREENS = [
  'register',
  'verify',
  'status',
  'kyc',
] as const;

export type OnboardingScreen = (typeof ONBOARDING_SCREENS)[number];

export type PharmacyLifecycleStatus =
  'PENDING_KYC' | 'KYC_SUBMITTED' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

export type RegisterAddress = {
  flat: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
};

export type RegisterValues = {
  owner_name: string;
  business_name: string;
  phone: string;
  email: string;
  password: string;
  business_type: 'PHARMACY';
  address: RegisterAddress;
  gstin: string;
  drug_licence_number: string;
  fssai_number?: string;
  pan_number: string;
};

export type RegistrationKycSummary = {
  documents_uploaded?: number;
  documents_required?: number;
  documents_verified?: number;
  documents_rejected?: number;
  rejection_reason?: string | null;
  next_step?: string;
  submitted_at?: string | null;
  can_reapply?: boolean;
};

export type RegistrationStatusPayload = {
  pharmacy_id?: string;
  business_name?: string;
  status?: PharmacyLifecycleStatus | string;
  plan?: string;
  email_verified?: boolean;
  kyc?: RegistrationKycSummary;
  profile_completeness_pct?: number;
};

export type KycDocumentRow = {
  document_id: string;
  document_type: string;
  status: string;
  rejection_reason?: string | null;
  expiry_date?: string | null;
  uploaded_at?: string;
};

export type KycListPayload = {
  pharmacy_id?: string;
  kyc_status?: string;
  documents?: KycDocumentRow[];
  required_documents?: string[];
  missing_documents?: string[];
  ready_to_submit?: boolean;
};

export const KYC_DOCUMENT_TYPES = [
  'GSTIN_CERTIFICATE',
  'DRUG_LICENCE',
  'FSSAI_CERTIFICATE',
  'PAN_CARD',
  'BANK_STATEMENT',
  'PROPRIETOR_ID',
] as const;

export type KycDocumentType = (typeof KYC_DOCUMENT_TYPES)[number];

export type OnboardingCommand =
  | { screen: 'register'; action: 'submit'; values: RegisterValues }
  | {
      screen: 'verify';
      action: 'verifyOtp';
      values: { email: string; otp: string };
    }
  | { screen: 'verify'; action: 'resendOtp'; values: { email: string } }
  | { screen: 'status'; action: 'load' | 'refresh' }
  | { screen: 'kyc'; action: 'list' }
  | {
      screen: 'kyc';
      action: 'upload';
      values: {
        document_type: string;
        file: File;
        expiry_date?: string;
      };
    }
  | { screen: 'kyc'; action: 'delete'; values: { document_id: string } }
  | { screen: 'kyc'; action: 'submit' };

export type OnboardingSubmitSuccess = {
  ok: true;
  nextStep?: 'verify' | 'status' | 'login' | 'done';
  status?: RegistrationStatusPayload;
  documents?: KycListPayload;
  retryAfterSeconds?: number;
  resendsRemaining?: number;
  missingTypes?: string[];
};

export type OnboardingSubmitFailure = {
  ok: false;
  fieldErrors?: Record<string, string>;
  formError?: string;
  code?: string;
  retryAfterSeconds?: number;
  missingTypes?: string[];
};

export type OnboardingSubmitResult =
  OnboardingSubmitSuccess | OnboardingSubmitFailure;

export type OnboardingFeatureData = {
  screen: OnboardingScreen;
  onSubmit: (command: OnboardingCommand) => Promise<OnboardingSubmitResult>;
  role?: 'pharmacy_owner' | 'pharmacy_staff' | null;
  canWriteKyc?: boolean;
  initialValues?: { email?: string };
  errors?: Record<string, string>;
  formError?: string;
  busy?: boolean;
  disabled?: boolean;
  links?: { login?: string };
  pollIntervalMs?: number;
};

export function isOnboardingScreen(value: unknown): value is OnboardingScreen {
  return (
    typeof value === 'string' &&
    (ONBOARDING_SCREENS as readonly string[]).includes(value)
  );
}

export function isOnboardingFeatureData(
  value: unknown,
): value is OnboardingFeatureData {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const feature = value as Partial<OnboardingFeatureData>;
  return (
    isOnboardingScreen(feature.screen) && typeof feature.onSubmit === 'function'
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

export function isValidPassword(value: string): boolean {
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
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

export function isKycDocumentType(value: string): value is KycDocumentType {
  return (KYC_DOCUMENT_TYPES as readonly string[]).includes(value);
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function normalizePhone(raw: string): string {
  return raw.trim().replace(/\s+/g, '');
}

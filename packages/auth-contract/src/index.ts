export const AUTH_PORTAL_TYPES = [
  'pharmacy',
  'pos',
  'customer-otp',
  'rider-otp',
  'admin',
  'admin-invite',
  'admin-reset',
  'pharmacy-register-otp',
  'sessions',
] as const;

export type AuthPortalType = (typeof AUTH_PORTAL_TYPES)[number];

export type AuthStep = 'credentials' | 'otp' | 'mfa';

export type AuthStepContext = {
  sessionId?: string;
  expiresAt?: string;
  resendAllowedAt?: string;
  attemptsRemaining?: number;
  expiresIn?: number;
};

export type AuthSessionRow = {
  sessionId: string;
  device?: string;
  ipAddress?: string;
  location?: string;
  lastActiveAt?: string;
  isCurrent?: boolean;
};

export type AuthCopy = {
  eyebrow?: string;
  title?: string;
  helper?: string;
  submitLabel?: string;
  identifierLabel?: string;
  passwordLabel?: string;
  brandLine?: string;
};

export type AuthCommand =
  | {
      portalType: 'pharmacy';
      action: 'login';
      values: { identifier: string; password: string; pharmacyId?: string };
    }
  | {
      portalType: 'pos';
      action: 'login';
      values: { pharmacyId: string; staffId: string; pin: string };
    }
  | {
      portalType: 'customer-otp';
      action: 'sendOtp' | 'resendOtp';
      values: { phone: string };
    }
  | {
      portalType: 'customer-otp';
      action: 'verifyOtp';
      values: { phone: string; otp: string; sessionId: string };
    }
  | {
      portalType: 'rider-otp';
      action: 'sendOtp' | 'resendOtp';
      values: { phone: string };
    }
  | {
      portalType: 'rider-otp';
      action: 'verifyOtp';
      values: { phone: string; otp: string; sessionId: string };
    }
  | {
      portalType: 'admin';
      action: 'login';
      values: { email: string; password: string };
    }
  | {
      portalType: 'admin';
      action: 'verifyMfa';
      values: { code: string };
    }
  | {
      portalType: 'admin-invite';
      action: 'complete';
      values: { inviteToken: string; password: string };
    }
  | {
      portalType: 'admin-reset';
      action: 'complete';
      values: { resetToken: string; password: string };
    }
  | {
      portalType: 'pharmacy-register-otp';
      action: 'sendOtp' | 'resendOtp';
      values: { email: string };
    }
  | {
      portalType: 'pharmacy-register-otp';
      action: 'verifyOtp';
      values: { email: string; otp: string };
    }
  | {
      portalType: 'sessions';
      action: 'list';
      values?: { page?: number };
    }
  | {
      portalType: 'sessions';
      action: 'revoke';
      values: { sessionId: string };
    };

export type AuthSubmitSuccess = {
  ok: true;
  nextStep?: 'otp' | 'mfa' | 'done';
  context?: AuthStepContext;
  sessions?: AuthSessionRow[];
  page?: number;
  hasNext?: boolean;
};

export type AuthSubmitFailure = {
  ok: false;
  fieldErrors?: Record<string, string>;
  formError?: string;
  code?: string;
  retryAfterSeconds?: number;
};

export type AuthSubmitResult = AuthSubmitSuccess | AuthSubmitFailure;

export type AuthFeatureData = {
  portalType: AuthPortalType;
  onSubmit: (command: AuthCommand) => Promise<AuthSubmitResult>;
  initialValues?: Record<string, string>;
  initialStep?: AuthStep;
  errors?: Record<string, string>;
  formError?: string;
  busy?: boolean;
  disabled?: boolean;
  copy?: Partial<AuthCopy>;
  links?: { posLogin?: string; staffLogin?: string };
  sessions?: AuthSessionRow[];
  otpContext?: AuthStepContext;
};

export function isAuthPortalType(value: unknown): value is AuthPortalType {
  return (
    typeof value === 'string' &&
    (AUTH_PORTAL_TYPES as readonly string[]).includes(value)
  );
}

export function isAuthFeatureData(value: unknown): value is AuthFeatureData {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const feature = value as Partial<AuthFeatureData>;
  return (
    isAuthPortalType(feature.portalType) &&
    typeof feature.onSubmit === 'function'
  );
}

export function normalizeIdentifier(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }
  return trimmed.replace(/\s+/g, '');
}

export function isValidIdentifier(value: string): boolean {
  if (value.includes('@')) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  return /^\+91[6-9]\d{9}$/.test(value);
}

export function isValidPhone(value: string): boolean {
  return /^\+91[6-9]\d{9}$/.test(value);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function isValidOtp(value: string): boolean {
  return /^\d{6}$/.test(value);
}

export function isValidPin(value: string): boolean {
  return /^\d{4}$/.test(value);
}

export function isValidPassword(value: string): boolean {
  return value.length >= 8;
}

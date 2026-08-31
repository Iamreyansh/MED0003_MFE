import type { AuthCopy, AuthPortalType } from '@medmate/auth-contract';

export const DEFAULT_EYEBROW = 'Namma MedMate';

export const PORTAL_COPY: Record<AuthPortalType, Required<AuthCopy>> = {
  pharmacy: {
    eyebrow: DEFAULT_EYEBROW,
    title: 'Sign in',
    helper: 'Pharmacy staff sign in with email or +91 mobile number.',
    submitLabel: 'Sign in',
    identifierLabel: 'Email or mobile',
    passwordLabel: 'Password',
    brandLine: 'Staff console · India',
  },
  pos: {
    eyebrow: DEFAULT_EYEBROW,
    title: 'POS sign in',
    helper: 'Counter PIN sign-in. PIN is exactly four digits.',
    submitLabel: 'Sign in',
    identifierLabel: 'Pharmacy ID',
    passwordLabel: 'Staff ID',
    brandLine: 'Counter · PIN',
  },
  'customer-otp': {
    eyebrow: DEFAULT_EYEBROW,
    title: 'Sign in',
    helper: 'We will send a 6-digit OTP to your mobile number.',
    submitLabel: 'Send OTP',
    identifierLabel: 'Mobile number',
    passwordLabel: 'OTP',
    brandLine: 'Customer app · India',
  },
  'rider-otp': {
    eyebrow: DEFAULT_EYEBROW,
    title: 'Rider sign in',
    helper: 'Registered riders sign in with a 6-digit OTP.',
    submitLabel: 'Send OTP',
    identifierLabel: 'Mobile number',
    passwordLabel: 'OTP',
    brandLine: 'Rider app · India',
  },
  admin: {
    eyebrow: DEFAULT_EYEBROW,
    title: 'Admin sign in',
    helper: 'Headquarters email and password. MFA may follow.',
    submitLabel: 'Sign in',
    identifierLabel: 'Email',
    passwordLabel: 'Password',
    brandLine: 'Admin HQ',
  },
  'admin-invite': {
    eyebrow: DEFAULT_EYEBROW,
    title: 'Set your password',
    helper: 'Complete your admin invite with a new password.',
    submitLabel: 'Save password',
    identifierLabel: 'Invite token',
    passwordLabel: 'New password',
    brandLine: 'Admin HQ',
  },
  'admin-reset': {
    eyebrow: DEFAULT_EYEBROW,
    title: 'Reset password',
    helper: 'Choose a new password with your reset token.',
    submitLabel: 'Reset password',
    identifierLabel: 'Reset token',
    passwordLabel: 'New password',
    brandLine: 'Admin HQ',
  },
  'pharmacy-register-otp': {
    eyebrow: DEFAULT_EYEBROW,
    title: 'Verify email',
    helper: 'Enter the email OTP sent during pharmacy registration.',
    submitLabel: 'Send OTP',
    identifierLabel: 'Email',
    passwordLabel: 'OTP',
    brandLine: 'Pharmacy onboarding',
  },
  sessions: {
    eyebrow: DEFAULT_EYEBROW,
    title: 'Sessions',
    helper: 'Devices signed in with this account.',
    submitLabel: 'Revoke',
    identifierLabel: 'Device',
    passwordLabel: 'Actions',
    brandLine: 'Account security',
  },
  'pharmacy-forgot': {
    eyebrow: DEFAULT_EYEBROW,
    title: 'Forgot password',
    helper:
      'Enter your email or +91 mobile. We send a reset only when messaging is live; owners can also issue a token from Roles.',
    submitLabel: 'Request reset',
    identifierLabel: 'Email or mobile',
    passwordLabel: 'Password',
    brandLine: 'Staff console · India',
  },
  'pharmacy-reset': {
    eyebrow: DEFAULT_EYEBROW,
    title: 'Reset password',
    helper:
      'Use the reset token from your owner or from email when messaging is live.',
    submitLabel: 'Reset password',
    identifierLabel: 'Reset token',
    passwordLabel: 'New password',
    brandLine: 'Staff console · India',
  },
};

export function resolveCopy(
  portalType: AuthPortalType,
  override?: Partial<AuthCopy>,
): Required<AuthCopy> {
  return { ...PORTAL_COPY[portalType], ...override };
}

export function rootTestId(portalType: AuthPortalType): string {
  if (portalType === 'pharmacy') {
    return 'login-page';
  }
  if (portalType === 'pos') {
    return 'pos-login-page';
  }
  if (portalType === 'sessions') {
    return 'sessions-page';
  }
  if (portalType === 'pharmacy-forgot') {
    return 'forgot-password-page';
  }
  if (portalType === 'pharmacy-reset') {
    return 'reset-password-page';
  }
  return 'auth-mfe';
}

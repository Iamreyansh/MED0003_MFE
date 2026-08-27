import type { OnboardingScreen } from '@medmate/onboarding-contract';

export type TrustPoint = {
  title: string;
  body: string;
};

export type ScreenCopy = {
  eyebrow: string;
  title: string;
  helper: string;
  brandLine: string;
  trust: TrustPoint[];
};

export const SCREEN_COPY: Record<OnboardingScreen, ScreenCopy> = {
  register: {
    eyebrow: 'Namma MedMate',
    title: 'Create your pharmacy',
    helper: 'Start on the Free plan. No payment at registration.',
    brandLine: 'Staff console · India',
    trust: [
      {
        title: 'Free to start',
        body: 'Core assigns Free. This form never charges a card.',
      },
      {
        title: 'Licences in one place',
        body: 'GSTIN, PAN, and drug licence stay with the shop record.',
      },
      {
        title: 'HQ reviews next',
        body: 'Marketplace stays closed until the pharmacy is active.',
      },
    ],
  },
  verify: {
    eyebrow: 'Namma MedMate',
    title: 'Verify email',
    helper: 'Enter the 6-digit OTP sent to the owner mailbox.',
    brandLine: 'Pharmacy onboarding',
    trust: [
      {
        title: 'Owner mailbox only',
        body: 'The OTP is sent to the email collected at registration.',
      },
      {
        title: 'Refresh-safe',
        body: 'Stay on this page if you need to resend the code.',
      },
      {
        title: 'Then KYC',
        body: 'Email must be verified before the document pack opens.',
      },
    ],
  },
  status: {
    eyebrow: 'Onboarding',
    title: 'Registration status',
    helper: 'Core decides when this pharmacy can go online.',
    brandLine: 'KYC review',
    trust: [
      {
        title: 'HQ decides go-live',
        body: 'Active is assigned after the pack is verified.',
      },
      {
        title: 'Marketplace gated',
        body: 'Orders stay blocked until the pharmacy is active.',
      },
      {
        title: 'Refresh anytime',
        body: 'Status also polls while this page is open.',
      },
    ],
  },
  kyc: {
    eyebrow: 'Onboarding',
    title: 'KYC documents',
    helper: 'Upload the pack HQ needs to review this pharmacy.',
    brandLine: 'Document packet',
    trust: [
      {
        title: 'Type and status only',
        body: 'Files are stored by Core. This screen does not preview them.',
      },
      {
        title: 'Owner writes',
        body: 'Staff can view the pack. Only the owner uploads or submits.',
      },
      {
        title: 'Verified files lock',
        body: 'Uploaded or rejected files can be replaced. Verified cannot.',
      },
    ],
  },
};

export const REGISTER_SECTIONS = {
  owner: {
    title: 'Owner',
    hint: 'Used for the owner login and OTP mailbox.',
  },
  shop: {
    title: 'Shop',
    hint: 'The name customers and HQ will see on this pharmacy.',
  },
  address: {
    title: 'Address',
    hint: 'Registered shop address in India.',
  },
  licences: {
    title: 'Licences',
    hint: 'GSTIN and PAN are required. FSSAI is optional.',
  },
} as const;

export function rootTestId(screen: OnboardingScreen): string {
  if (screen === 'register') {
    return 'register-page';
  }
  if (screen === 'verify') {
    return 'register-verify-page';
  }
  if (screen === 'status') {
    return 'onboarding-status-page';
  }
  return 'onboarding-kyc-page';
}

export const DOCUMENT_TYPE_LABEL: Record<string, string> = {
  GSTIN_CERTIFICATE: 'GSTIN certificate',
  DRUG_LICENCE: 'Drug licence',
  FSSAI_CERTIFICATE: 'FSSAI certificate',
  PAN_CARD: 'PAN card',
  BANK_STATEMENT: 'Bank statement',
  PROPRIETOR_ID: 'Proprietor ID',
};

export function documentTypeLabel(type: string): string {
  return DOCUMENT_TYPE_LABEL[type] ?? type.replaceAll('_', ' ');
}

export const STATUS_LABEL: Record<string, string> = {
  PENDING_KYC: 'Pending KYC',
  KYC_SUBMITTED: 'Submitted for review',
  ACTIVE: 'Active',
  REJECTED: 'Rejected',
  SUSPENDED: 'Suspended',
  UPLOADED: 'Uploaded',
  SCAN_CLEAN: 'Scan clean',
  UNDER_REVIEW: 'Under review',
  VERIFIED: 'Verified',
};

export function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status.replaceAll('_', ' ');
}

export function isAttentionStatus(status: string): boolean {
  return status === 'REJECTED' || status === 'SUSPENDED';
}

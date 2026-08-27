import type { OnboardingScreen } from '@medmate/onboarding-contract';

export type FlowState = 'done' | 'current' | 'upcoming';

export const FLOW_STEPS = [
  { screen: 'register' as const, label: 'Account', hint: 'Shop and owner' },
  { screen: 'verify' as const, label: 'Email', hint: 'Owner OTP' },
  { screen: 'kyc' as const, label: 'Documents', hint: 'KYC pack' },
  { screen: 'status' as const, label: 'Review', hint: 'HQ decision' },
];

export function flowIndex(screen: OnboardingScreen): number {
  const index = FLOW_STEPS.findIndex((step) => step.screen === screen);
  return index < 0 ? 0 : index;
}

export function flowState(index: number, current: number): FlowState {
  if (index < current) {
    return 'done';
  }
  if (index === current) {
    return 'current';
  }
  return 'upcoming';
}

export function statusProgressStep(
  status?: string,
  emailVerified?: boolean,
): number {
  if (status === 'ACTIVE') {
    return 3;
  }
  if (status === 'KYC_SUBMITTED' || status === 'REJECTED') {
    return 2;
  }
  if (status === 'PENDING_KYC' && emailVerified) {
    return 1;
  }
  return 0;
}

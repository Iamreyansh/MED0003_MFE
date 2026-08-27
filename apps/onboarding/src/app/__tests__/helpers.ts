import type {
  OnboardingFeatureData,
  OnboardingScreen,
} from '@medmate/onboarding-contract';
import { createMfeEnvelope } from '@medmate/test-utils';

export function feature(
  screen: OnboardingScreen,
  onSubmit: OnboardingFeatureData['onSubmit'] = async () => ({ ok: true }),
  extra: Partial<OnboardingFeatureData> = {},
): OnboardingFeatureData {
  return { screen, onSubmit, ...extra };
}

export function data(next: OnboardingFeatureData) {
  return createMfeEnvelope({
    feature: next,
    context: { hostId: 'test-host', locale: 'en-IN', permissions: [] },
  });
}

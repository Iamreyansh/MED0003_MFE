import { assertMfeDataEnvelope } from '@medmate/contracts';
import { isOnboardingFeatureData } from '@medmate/onboarding-contract';
import { StatusMessage } from '@medmate/ui';
import type { OnboardingMfeProps } from '../contract';
import { OnboardingLayout } from '../layouts/OnboardingLayout';

export default function OnboardingMfe({ data }: OnboardingMfeProps) {
  assertMfeDataEnvelope(data);
  if (!isOnboardingFeatureData(data.feature)) {
    return (
      <StatusMessage tone="error" data-testid="onboarding-contract-error">
        Onboarding module is missing a screen.
      </StatusMessage>
    );
  }
  return <OnboardingLayout data={data} />;
}

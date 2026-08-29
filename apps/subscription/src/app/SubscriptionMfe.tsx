import { assertMfeDataEnvelope } from '@medmate/contracts';
import { isSubscriptionFeatureData } from '@medmate/subscription-contract';
import { StatusMessage } from '@medmate/ui';
import type { SubscriptionMfeProps } from '../contract';
import { SubscriptionLayout } from '../layouts/SubscriptionLayout';

export default function SubscriptionMfe({ data }: SubscriptionMfeProps) {
  assertMfeDataEnvelope(data);
  if (!isSubscriptionFeatureData(data.feature)) {
    return (
      <StatusMessage tone="error" data-testid="subscription-contract-error">
        Subscription module is missing a screen.
      </StatusMessage>
    );
  }
  return <SubscriptionLayout data={data} />;
}

import { isBillingFeatureData } from '@medmate/billing-contract';
import { assertMfeDataEnvelope } from '@medmate/contracts';
import { StatusMessage } from '@medmate/ui';
import type { BillingMfeProps } from '../contract';
import { BillingLayout } from '../layouts/BillingLayout';

export default function BillingMfe({ data }: BillingMfeProps) {
  assertMfeDataEnvelope(data);
  if (!isBillingFeatureData(data.feature)) {
    return (
      <StatusMessage tone="error" data-testid="billing-contract-error">
        Billing module is missing a screen.
      </StatusMessage>
    );
  }
  return <BillingLayout data={data} />;
}

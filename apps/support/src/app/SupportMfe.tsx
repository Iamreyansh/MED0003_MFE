import { assertMfeDataEnvelope } from '@medmate/contracts';
import { isSupportFeatureData } from '@medmate/support-contract';
import { StatusMessage } from '@medmate/ui';
import type { SupportMfeProps } from '../contract';
import { SupportLayout } from '../layouts/SupportLayout';

export default function SupportMfe({ data }: SupportMfeProps) {
  assertMfeDataEnvelope(data);
  if (!isSupportFeatureData(data.feature)) {
    return (
      <StatusMessage tone="error" data-testid="support-contract-error">
        Support module is missing a screen.
      </StatusMessage>
    );
  }
  return <SupportLayout data={data} />;
}

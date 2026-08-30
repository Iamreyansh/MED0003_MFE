import { isAnalyticsFeatureData } from '@medmate/analytics-contract';
import { assertMfeDataEnvelope } from '@medmate/contracts';
import { StatusMessage } from '@medmate/ui';
import type { AnalyticsMfeProps } from '../contract';
import { AnalyticsLayout } from '../layouts/AnalyticsLayout';

export default function AnalyticsMfe({ data }: AnalyticsMfeProps) {
  assertMfeDataEnvelope(data);
  if (!isAnalyticsFeatureData(data.feature)) {
    return (
      <StatusMessage tone="error" data-testid="analytics-contract-error">
        Analytics module is missing a screen.
      </StatusMessage>
    );
  }
  return <AnalyticsLayout data={data} />;
}

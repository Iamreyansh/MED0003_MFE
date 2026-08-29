import { isSubscriptionScreen } from '@medmate/subscription-contract';
import { Box, StatusMessage } from '@medmate/ui';
import type { SubscriptionMfeProps } from '../contract';
import { SCREEN_COPY, rootTestId } from '../lib/copy';
import { BillingScreen } from '../ui/billing';
import { PlansScreen } from '../ui/plans';
import { PageHeader } from '../ui/shared/page-header';

export function SubscriptionLayout({ data }: SubscriptionMfeProps) {
  const feature = data.feature;
  if (!isSubscriptionScreen(feature.screen)) {
    return (
      <StatusMessage tone="error">Unknown subscription screen.</StatusMessage>
    );
  }
  const copy = SCREEN_COPY[feature.screen];
  return (
    <Box data-testid={rootTestId(feature.screen)} className="w-full">
      <PageHeader
        title={copy.title}
        helper={copy.helper}
        kicker={copy.kicker}
      />
      {feature.screen === 'plans' ? (
        <PlansScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
          createIdempotencyKey={data.capabilities?.api?.createIdempotencyKey}
        />
      ) : (
        <BillingScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
          createIdempotencyKey={data.capabilities?.api?.createIdempotencyKey}
        />
      )}
    </Box>
  );
}

import type { MfeProps } from '@medmate/contracts';
import type { SubscriptionFeatureData } from '@medmate/subscription-contract';

export type { SubscriptionFeatureData } from '@medmate/subscription-contract';

export type SubscriptionMfeProps = MfeProps<SubscriptionFeatureData>;

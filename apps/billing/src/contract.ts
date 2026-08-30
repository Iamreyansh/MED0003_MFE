import type { BillingFeatureData } from '@medmate/billing-contract';
import type { MfeProps } from '@medmate/contracts';

export type { BillingFeatureData } from '@medmate/billing-contract';

export type BillingMfeProps = MfeProps<BillingFeatureData>;

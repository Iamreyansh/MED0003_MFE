import type { MfeProps } from '@medmate/contracts';
import type { ProcurementFeatureData } from '@medmate/procurement-contract';

export type { ProcurementFeatureData } from '@medmate/procurement-contract';

export type ProcurementMfeProps = MfeProps<ProcurementFeatureData>;

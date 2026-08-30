import type { MfeProps } from '@medmate/contracts';
import type { PosFeatureData } from '@medmate/pos-contract';

export type { PosFeatureData } from '@medmate/pos-contract';

export type PosMfeProps = MfeProps<PosFeatureData>;

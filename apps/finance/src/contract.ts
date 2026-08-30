import type { MfeProps } from '@medmate/contracts';
import type { FinanceFeatureData } from '@medmate/finance-contract';

export type { FinanceFeatureData } from '@medmate/finance-contract';

export type FinanceMfeProps = MfeProps<FinanceFeatureData>;

import type { MfeProps } from '@medmate/contracts';
import type { OrdersFeatureData } from '@medmate/orders-contract';

export type { OrdersFeatureData } from '@medmate/orders-contract';

export type OrdersMfeProps = MfeProps<OrdersFeatureData>;

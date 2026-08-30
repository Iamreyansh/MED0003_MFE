import type { MfeProps } from '@medmate/contracts';
import type { InventoryFeatureData } from '@medmate/inventory-contract';

export type { InventoryFeatureData } from '@medmate/inventory-contract';

export type InventoryMfeProps = MfeProps<InventoryFeatureData>;

import { assertMfeDataEnvelope } from '@medmate/contracts';
import { isInventoryFeatureData } from '@medmate/inventory-contract';
import { StatusMessage } from '@medmate/ui';
import type { InventoryMfeProps } from '../contract';
import { InventoryLayout } from '../layouts/InventoryLayout';

export default function InventoryMfe({ data }: InventoryMfeProps) {
  assertMfeDataEnvelope(data);
  if (!isInventoryFeatureData(data.feature)) {
    return (
      <StatusMessage tone="error" data-testid="inventory-contract-error">
        Inventory module is missing a screen.
      </StatusMessage>
    );
  }
  return <InventoryLayout data={data} />;
}

import { assertMfeDataEnvelope } from '@medmate/contracts';
import { isOrdersFeatureData } from '@medmate/orders-contract';
import { StatusMessage } from '@medmate/ui';
import type { OrdersMfeProps } from '../contract';
import { OrdersLayout } from '../layouts/OrdersLayout';

export default function OrdersMfe({ data }: OrdersMfeProps) {
  assertMfeDataEnvelope(data);
  if (!isOrdersFeatureData(data.feature)) {
    return (
      <StatusMessage tone="error" data-testid="orders-contract-error">
        Orders module is missing a screen.
      </StatusMessage>
    );
  }
  return <OrdersLayout data={data} />;
}

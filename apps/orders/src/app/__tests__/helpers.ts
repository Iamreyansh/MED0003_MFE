import type { MfeDataEnvelope } from '@medmate/contracts';
import type {
  OrdersFeatureData,
  OrdersScreen,
  OrdersSubmitResult,
} from '@medmate/orders-contract';
import { createMfeEnvelope } from '@medmate/test-utils';

export const ORDER_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
export const RIDER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

export function feature(
  screen: OrdersScreen,
  onSubmit: OrdersFeatureData['onSubmit'] = async () => ({ ok: true }),
  extra: Partial<OrdersFeatureData> = {},
): OrdersFeatureData {
  return {
    screen,
    onSubmit,
    role: 'pharmacy_owner',
    plan: 'FREE',
    canMutateOrders: true,
    orderId: screen === 'order-actions' ? ORDER_ID : null,
    tokenScope: 'full',
    ...extra,
  };
}

export function data(
  next: OrdersFeatureData,
  extra: Partial<MfeDataEnvelope<OrdersFeatureData>> = {},
) {
  return {
    ...createMfeEnvelope({
      feature: next,
      context: { hostId: 'test-host', locale: 'en-IN', permissions: [] },
    }),
    ...extra,
  };
}

export const QUOTE_LIST: OrdersSubmitResult = {
  ok: true,
  quotes: [
    {
      quote_id: 'q-1',
      status: 'NOTIFIED',
      created_at: '2026-08-30',
    },
    {
      quote_id: 'q-expired',
      status: 'EXPIRED',
      created_at: '2026-08-29',
    },
  ],
  meta: { page: 1, has_next: true },
};

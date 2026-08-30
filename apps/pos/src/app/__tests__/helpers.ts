import type { MfeDataEnvelope } from '@medmate/contracts';
import type {
  PosCart,
  PosFeatureData,
  PosSubmitResult,
} from '@medmate/pos-contract';
import { createMfeEnvelope } from '@medmate/test-utils';

export function feature(
  onSubmit: PosFeatureData['onSubmit'] = async () => ({ ok: true }),
  extra: Partial<PosFeatureData> = {},
): PosFeatureData {
  return {
    screen: 'counter',
    onSubmit,
    role: 'pharmacy_owner',
    plan: 'FREE',
    tokenScope: 'full',
    cartId: 'cart-1',
    canSell: true,
    ...extra,
  };
}

export function data(
  next: PosFeatureData,
  extra: Partial<MfeDataEnvelope<PosFeatureData>> = {},
) {
  return {
    ...createMfeEnvelope({
      feature: next,
      context: { hostId: 'test-host', locale: 'en-IN', permissions: [] },
    }),
    ...extra,
  };
}

export const EMPTY_CART: PosCart = {
  cart_id: 'cart-1',
  status: 'ACTIVE',
  items: [],
  grand_total: 0,
};

export const LINED_CART: PosCart = {
  cart_id: 'cart-1',
  status: 'ACTIVE',
  items: [
    {
      item_id: 'item-1',
      product_id: 'prod-1',
      product_name: 'Crocin 500mg Tablet',
      batch_number: 'B1',
      expiry_date: '2027-01-01',
      quantity: 2,
      line_total: 48,
    },
  ],
  subtotal: 48,
  discount_amount: 0,
  grand_total: 48,
};

export const CART_RESULT: PosSubmitResult = {
  ok: true,
  cart: EMPTY_CART,
};

export const LINED_RESULT: PosSubmitResult = {
  ok: true,
  cart: LINED_CART,
};

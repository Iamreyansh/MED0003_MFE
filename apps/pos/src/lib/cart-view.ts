import type {
  PosCart,
  PosCartLine,
  PosDiscountResult,
} from '@medmate/pos-contract';
import { asRupees } from '@medmate/pos-contract';

function moneyOr(value: unknown, fallback: number | null | undefined) {
  return asRupees(value) ?? fallback ?? undefined;
}

export function patchCartLine(
  cart: PosCart | null,
  itemId: string,
  qty: number,
  item: PosCartLine | null | undefined,
): PosCart | null {
  if (!cart) {
    return cart;
  }
  return {
    ...cart,
    grand_total: moneyOr(item?.cart_grand_total, cart.grand_total),
    items: (cart.items ?? []).map((line) =>
      line.item_id === itemId
        ? {
            ...line,
            quantity: item?.quantity ?? qty,
            line_total: moneyOr(item?.line_total, line.line_total),
            gst_amount: moneyOr(item?.gst_amount, line.gst_amount),
            unit_price: moneyOr(item?.unit_price, line.unit_price),
          }
        : line,
    ),
  };
}

export function mergeDiscount(
  cart: PosCart | null,
  discount: PosDiscountResult,
): PosCart | null {
  if (!cart) {
    return cart;
  }
  return {
    ...cart,
    discount_type: discount.discount_type ?? cart.discount_type,
    discount_value: moneyOr(discount.discount_value, cart.discount_value),
    discount_amount: moneyOr(discount.discount_amount, cart.discount_amount),
    grand_total: moneyOr(discount.grand_total, cart.grand_total),
  };
}

export function dropEditQty(
  current: Record<string, string>,
  itemId: string,
): Record<string, string> {
  const next = { ...current };
  delete next[itemId];
  return next;
}

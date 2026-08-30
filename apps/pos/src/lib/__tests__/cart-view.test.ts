import { describe, expect, it } from 'vitest';
import { dropEditQty, mergeDiscount, patchCartLine } from '../cart-view';

const cart = {
  cart_id: 'cart-1',
  items: [
    { item_id: 'item-1', quantity: 1, line_total: 24 },
    { item_id: 'item-2', quantity: 2, line_total: 10 },
  ],
  grand_total: 34,
};

describe('cart-view', () => {
  it('patches a line and ignores a missing cart', () => {
    expect(patchCartLine(null, 'item-1', 3, undefined)).toBeNull();
    expect(
      patchCartLine(
        { cart_id: 'cart-1', grand_total: 0 },
        'item-1',
        2,
        undefined,
      )?.items,
    ).toEqual([]);
    const next = patchCartLine(cart, 'item-1', 3, {
      item_id: 'item-1',
      quantity: 3,
      line_total: 72,
      cart_grand_total: 82,
      gst_amount: 4,
      unit_price: 24,
    });
    expect(next?.items?.[0]).toMatchObject({ quantity: 3, line_total: 72 });
    expect(next?.items?.[1]).toMatchObject({ item_id: 'item-2', quantity: 2 });
    expect(next?.grand_total).toBe(82);
    expect(
      patchCartLine(cart, 'item-1', 4, { item_id: 'item-1' })?.items?.[0],
    ).toMatchObject({
      quantity: 4,
      line_total: 24,
    });
  });

  it('merges a discount payload and keeps fallbacks', () => {
    expect(mergeDiscount(null, { grand_total: 1 })).toBeNull();
    expect(
      mergeDiscount(cart, {
        discount_type: 'PERCENTAGE',
        discount_value: 10,
        discount_amount: 3.4,
        grand_total: 30.6,
      }),
    ).toMatchObject({
      discount_type: 'PERCENTAGE',
      discount_value: 10,
      discount_amount: 3.4,
      grand_total: 30.6,
    });
    expect(mergeDiscount(cart, {})).toMatchObject({ grand_total: 34 });
  });

  it('drops a local quantity draft', () => {
    expect(dropEditQty({ 'item-1': '3', 'item-2': '1' }, 'item-1')).toEqual({
      'item-2': '1',
    });
    expect(dropEditQty({}, 'item-1')).toEqual({});
  });
});

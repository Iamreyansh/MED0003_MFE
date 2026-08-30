import { describe, expect, it } from 'vitest';
import {
  INVENTORY_SCREENS,
  formatIstDate,
  isInventoryFeatureData,
  isInventoryScreen,
  isNegativeQty,
  isPlanFeatureLocked,
  isProductNotFound,
  isRackNotFound,
  onlineVisibilityLockCopy,
  parsePositiveQty,
  productDisplayName,
  sortBatchesByExpiry,
} from '../index';

describe('inventory-contract', () => {
  it('recognises screens and feature payloads', () => {
    expect(INVENTORY_SCREENS).toContain('list');
    expect(isInventoryScreen('expiry')).toBe(true);
    expect(isInventoryScreen('nope')).toBe(false);
    expect(isInventoryScreen(1)).toBe(false);
    expect(isInventoryFeatureData(null)).toBe(false);
    expect(isInventoryFeatureData({})).toBe(false);
    expect(
      isInventoryFeatureData({
        screen: 'list',
        onSubmit: async () => ({ ok: true }),
      }),
    ).toBe(true);
  });

  it('labels products and formats IST expiry dates', () => {
    expect(productDisplayName({ product_id: '1' })).toBe('Product');
    expect(
      productDisplayName({ product_id: '1', medicine_name: 'Crocin' }),
    ).toBe('Crocin');
    expect(
      productDisplayName({
        product_id: '1',
        name: 'Crocin 500',
        medicine_name: 'Ignored',
      }),
    ).toBe('Crocin 500');
    expect(formatIstDate(null)).toBe('—');
    expect(formatIstDate('')).toBe('—');
    expect(formatIstDate('not-a-date')).toBe('not-a-date');
    expect(formatIstDate('2026-03-15T18:30:00.000Z')).toMatch(/Mar/);
  });

  it('sorts FEFO and validates quantities', () => {
    expect(
      sortBatchesByExpiry([
        { batch_id: 'b', expiry_date: '2027-01-01' },
        { batch_id: 'a', expiry_date: '2026-01-01' },
        { batch_id: 'none' },
        { batch_id: 'bad', expiry_date: 'nope' },
      ]).map((row) => row.batch_id),
    ).toEqual(['a', 'b', 'none', 'bad']);
    expect(
      sortBatchesByExpiry([
        { batch_id: 'dated', expiry_date: '2026-06-01' },
        { batch_id: 'missing' },
      ]).map((row) => row.batch_id),
    ).toEqual(['dated', 'missing']);
    expect(
      sortBatchesByExpiry([{ batch_id: 'x' }, { batch_id: 'y' }]),
    ).toHaveLength(2);
    expect(isNegativeQty(-1)).toBe(true);
    expect(isNegativeQty(0)).toBe(false);
    expect(isNegativeQty('x')).toBe(false);
    expect(parsePositiveQty('2')).toBe(2);
    expect(parsePositiveQty('')).toBeNull();
    expect(parsePositiveQty('-1')).toBeNull();
    expect(parsePositiveQty('nope')).toBeNull();
  });

  it('maps domain error codes and Growth lock copy', () => {
    expect(isProductNotFound('PRODUCT_NOT_FOUND')).toBe(true);
    expect(isRackNotFound('RACK_NOT_FOUND')).toBe(true);
    expect(isPlanFeatureLocked('PLAN_FEATURE_LOCKED')).toBe(true);
    expect(isPlanFeatureLocked('MODULE_NOT_IN_PLAN')).toBe(true);
    expect(isPlanFeatureLocked('FORBIDDEN')).toBe(false);
    expect(onlineVisibilityLockCopy()).toMatch(/Growth/);
    expect(onlineVisibilityLockCopy()).not.toMatch(/RETAIL_PRO/);
  });
});

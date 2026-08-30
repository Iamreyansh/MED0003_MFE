import { describe, expect, it } from 'vitest';
import {
  CSV_COLUMNS,
  CSV_MAX_BYTES,
  PROCUREMENT_SCREENS,
  distributorsLockCopy,
  formatInr,
  isCsvTooLarge,
  isDistributorNotFound,
  isGrnNotFound,
  isPlanFeatureLocked,
  isPoNotFound,
  isProcurementFeatureData,
  isProcurementScreen,
  isStaffCannotStock,
  parsePositiveQty,
  reorderLockCopy,
} from '../index';

describe('procurement-contract', () => {
  it('recognises screens and feature payloads', () => {
    expect(PROCUREMENT_SCREENS).toContain('purchases');
    expect(isProcurementScreen('editor')).toBe(true);
    expect(isProcurementScreen('nope')).toBe(false);
    expect(isProcurementScreen(1)).toBe(false);
    expect(isProcurementFeatureData(null)).toBe(false);
    expect(isProcurementFeatureData({})).toBe(false);
    expect(
      isProcurementFeatureData({
        screen: 'purchases',
        onSubmit: async () => ({ ok: true }),
      }),
    ).toBe(true);
  });

  it('maps domain error codes and Growth lock copy', () => {
    expect(isGrnNotFound('GRN_NOT_FOUND')).toBe(true);
    expect(isDistributorNotFound('DISTRIBUTOR_NOT_FOUND')).toBe(true);
    expect(isPoNotFound('PO_NOT_FOUND')).toBe(true);
    expect(isStaffCannotStock('STAFF_CANNOT_STOCK')).toBe(true);
    expect(isPlanFeatureLocked('PLAN_FEATURE_LOCKED')).toBe(true);
    expect(isPlanFeatureLocked('MODULE_NOT_IN_PLAN')).toBe(true);
    expect(isPlanFeatureLocked('FORBIDDEN')).toBe(false);
    expect(distributorsLockCopy()).toMatch(/Growth/);
    expect(reorderLockCopy()).toMatch(/Growth/);
    expect(distributorsLockCopy()).not.toMatch(/RETAIL_PRO/);
    expect(CSV_COLUMNS).toContain('product_name');
  });

  it('formats rupees and validates quantities and CSV size', () => {
    expect(formatInr(null)).toBe('—');
    expect(formatInr('x')).toBe('—');
    expect(formatInr(Number.NaN)).toBe('—');
    expect(formatInr(1300)).toMatch(/1,300/);
    expect(parsePositiveQty('2')).toBe(2);
    expect(parsePositiveQty('')).toBeNull();
    expect(parsePositiveQty('-1')).toBeNull();
    expect(parsePositiveQty('nope')).toBeNull();
    expect(isCsvTooLarge({ size: CSV_MAX_BYTES })).toBe(false);
    expect(isCsvTooLarge({ size: CSV_MAX_BYTES + 1 })).toBe(true);
  });
});

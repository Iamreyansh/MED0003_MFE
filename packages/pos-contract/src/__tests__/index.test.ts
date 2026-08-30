import { describe, expect, it } from 'vitest';
import {
  PAYMENT_METHODS,
  POS_API_PATH_PREFIX,
  POS_SCREENS,
  asRupees,
  formatInr,
  isCartStale,
  isInsufficientStock,
  isModuleNotInPlan,
  isPharmacyPosApiPath,
  isPosFeatureData,
  isPosScreen,
  isPosTokenRestricted,
  MAX_MANUAL_DISCOUNT_PCT,
  openAfterFullLoginCopy,
  parseDiscountInput,
  parsePositiveQty,
  paymentMethodLabel,
} from '../index';

describe('pos-contract', () => {
  it('recognises screens and feature payloads', () => {
    expect(POS_SCREENS).toContain('counter');
    expect(isPosScreen('counter')).toBe(true);
    expect(isPosScreen('nope')).toBe(false);
    expect(isPosScreen(1)).toBe(false);
    expect(isPosFeatureData(null)).toBe(false);
    expect(isPosFeatureData({})).toBe(false);
    expect(
      isPosFeatureData({
        screen: 'counter',
        onSubmit: async () => ({ ok: true }),
      }),
    ).toBe(true);
  });

  it('allowlists only pharmacy POS API paths', () => {
    expect(POS_API_PATH_PREFIX).toBe('/api/v1/pharmacy/pos/');
    expect(isPharmacyPosApiPath('/api/v1/pharmacy/pos/cart')).toBe(true);
    expect(
      isPharmacyPosApiPath('/api/v1/pharmacy/pos/cart/1/checkout?x=1'),
    ).toBe(true);
    expect(isPharmacyPosApiPath('/api/v1/pharmacy/inventory')).toBe(false);
    expect(isPharmacyPosApiPath('/api/v1/pharmacy/pos')).toBe(false);
    expect(isPharmacyPosApiPath('/api/v1/health')).toBe(false);
  });

  it('maps domain error codes and payment labels', () => {
    expect(isCartStale('CART_NOT_FOUND')).toBe(true);
    expect(isCartStale('CART_EXPIRED')).toBe(true);
    expect(isCartStale('EMPTY_CART')).toBe(false);
    expect(isInsufficientStock('INSUFFICIENT_STOCK')).toBe(true);
    expect(isPosTokenRestricted('POS_TOKEN_RESTRICTED')).toBe(true);
    expect(isModuleNotInPlan('MODULE_NOT_IN_PLAN')).toBe(true);
    expect(PAYMENT_METHODS).toContain('CASH');
    expect(paymentMethodLabel('CASH')).toBe('Cash');
    expect(paymentMethodLabel('UPI')).toBe('UPI');
    expect(paymentMethodLabel('CARD')).toBe('Card');
    expect(paymentMethodLabel('COD')).toBe('Cash on delivery');
    expect(paymentMethodLabel('CREDIT')).toBe('Khata / credit');
    expect(paymentMethodLabel('INSURANCE_TPA')).toBe('Insurance / TPA');
    expect(openAfterFullLoginCopy()).toMatch(/full login/);
  });

  it('formats rupees and requires quantity above zero', () => {
    expect(formatInr(null)).toBe('—');
    expect(formatInr('x')).toBe('—');
    expect(formatInr(Number.NaN)).toBe('—');
    expect(formatInr(1300)).toMatch(/1,300/);
    expect(formatInr('45.00')).toMatch(/45/);
    expect(asRupees('10')).toBe(10);
    expect(asRupees('')).toBeNull();
    expect(asRupees({})).toBeNull();
    expect(parsePositiveQty('2')).toBe(2);
    expect(parsePositiveQty('')).toBeNull();
    expect(parsePositiveQty('0')).toBeNull();
    expect(parsePositiveQty('-1')).toBeNull();
    expect(parsePositiveQty('nope')).toBeNull();
    expect(parseDiscountInput('10%')).toBe(10);
    expect(parseDiscountInput(' 5 ')).toBe(5);
    expect(parseDiscountInput('')).toBeNull();
    expect(parseDiscountInput('0')).toBeNull();
    expect(parseDiscountInput('%')).toBeNull();
    expect(MAX_MANUAL_DISCOUNT_PCT).toBe(30);
  });
});

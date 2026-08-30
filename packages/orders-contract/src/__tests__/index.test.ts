import { describe, expect, it } from 'vitest';
import {
  ORDER_PACKING_STATUSES,
  ORDERS_SCREENS,
  QUOTE_STATUS_FILTERS,
  isExpiredQuote,
  isInvalidStatusTransition,
  isOrderAlreadyActioned,
  isOrderNotFound,
  isOrdersFeatureData,
  isOrdersScreen,
  isOrdersUuid,
  isPosTokenRestricted,
  isPriceAboveMrp,
} from '../index';

describe('orders-contract', () => {
  it('recognises screens and feature payloads', () => {
    expect(ORDERS_SCREENS).toContain('rx-quotes');
    expect(isOrdersScreen('order-actions')).toBe(true);
    expect(isOrdersScreen('orders-home')).toBe(true);
    expect(isOrdersScreen('nope')).toBe(false);
    expect(isOrdersScreen(1)).toBe(false);
    expect(isOrdersFeatureData(null)).toBe(false);
    expect(isOrdersFeatureData({})).toBe(false);
    expect(
      isOrdersFeatureData({
        screen: 'rx-quotes',
        onSubmit: async () => ({ ok: true }),
      }),
    ).toBe(true);
  });

  it('maps domain error codes and packing statuses', () => {
    expect(isPriceAboveMrp('PRICE_ABOVE_MRP')).toBe(true);
    expect(isPriceAboveMrp('VALIDATION_ERROR')).toBe(false);
    expect(isOrderNotFound('ORDER_NOT_FOUND')).toBe(true);
    expect(isOrderAlreadyActioned('ORDER_ALREADY_ACTIONED')).toBe(true);
    expect(isInvalidStatusTransition('INVALID_STATUS_TRANSITION')).toBe(true);
    expect(isPosTokenRestricted('POS_TOKEN_RESTRICTED')).toBe(true);
    expect(isExpiredQuote('EXPIRED')).toBe(true);
    expect(isExpiredQuote(undefined)).toBe(false);
    expect(isExpiredQuote(null)).toBe(false);
    expect(isExpiredQuote('QUOTED')).toBe(false);
    expect(ORDER_PACKING_STATUSES).not.toContain('DELIVERED');
    expect(QUOTE_STATUS_FILTERS).toContain('NOTIFIED');
  });

  it('validates UUIDs', () => {
    expect(isOrdersUuid('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe(true);
    expect(isOrdersUuid('nope')).toBe(false);
    expect(isOrdersUuid('')).toBe(false);
  });
});

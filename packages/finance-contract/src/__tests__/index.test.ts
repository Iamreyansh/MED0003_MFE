import { describe, expect, it } from 'vitest';
import {
  FINANCE_SCREENS,
  SETTLEMENT_FIELD_LABELS,
  formatInr,
  isFinanceFeatureData,
  isFinanceScreen,
  isFinanceUuid,
  isForbidden,
  isPosTokenRestricted,
  isSettlementDateKey,
  isSettlementMoneyKey,
  isSettlementNotFound,
  settlementFieldLabel,
} from '../index';

describe('finance-contract', () => {
  it('recognises screens and feature payloads', () => {
    expect(FINANCE_SCREENS).toContain('settlements');
    expect(isFinanceScreen('settlement-detail')).toBe(true);
    expect(isFinanceScreen('nope')).toBe(false);
    expect(isFinanceScreen(1)).toBe(false);
    expect(isFinanceFeatureData(null)).toBe(false);
    expect(isFinanceFeatureData({})).toBe(false);
    expect(
      isFinanceFeatureData({
        screen: 'settlements',
        onSubmit: async () => ({ ok: true }),
      }),
    ).toBe(true);
  });

  it('maps domain error codes and field helpers', () => {
    expect(isSettlementNotFound('SETTLEMENT_NOT_FOUND')).toBe(true);
    expect(isSettlementNotFound('FORBIDDEN')).toBe(false);
    expect(isForbidden('FORBIDDEN')).toBe(true);
    expect(isForbidden('INSUFFICIENT_PERMISSIONS')).toBe(true);
    expect(isForbidden('SETTLEMENT_NOT_FOUND')).toBe(false);
    expect(isPosTokenRestricted('POS_TOKEN_RESTRICTED')).toBe(true);
    expect(isSettlementMoneyKey('net_payable')).toBe(true);
    expect(isSettlementMoneyKey('status')).toBe(false);
    expect(isSettlementDateKey('released_at')).toBe(true);
    expect(isSettlementDateKey('gmv')).toBe(false);
    expect(settlementFieldLabel('net_payable')).toBe('Net payable');
    expect(settlementFieldLabel('custom_field')).toBe('custom field');
    expect(SETTLEMENT_FIELD_LABELS.settlement_id).toBe('Settlement');
  });

  it('validates UUIDs and formats rupees', () => {
    expect(isFinanceUuid('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe(true);
    expect(isFinanceUuid('nope')).toBe(false);
    expect(isFinanceUuid('')).toBe(false);
    expect(formatInr(null)).toBe('—');
    expect(formatInr('x')).toBe('—');
    expect(formatInr(Number.NaN)).toBe('—');
    expect(formatInr(1300)).toMatch(/1,300/);
  });
});

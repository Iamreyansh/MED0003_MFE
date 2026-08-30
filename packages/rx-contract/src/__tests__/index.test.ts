import { describe, expect, it } from 'vitest';
import {
  DRUG_REGISTER_SCHEDULE_FILTERS,
  RX_SCREENS,
  RX_STATUS_FILTERS,
  isControlledSchedule,
  isInsufficientStock,
  isPlanFeatureLocked,
  isRxFeatureData,
  isRxNotFound,
  isRxScreen,
  rxLockCopy,
} from '../index';

describe('rx-contract', () => {
  it('recognises screens and feature payloads', () => {
    expect(RX_SCREENS).toContain('queue');
    expect(isRxScreen('detail')).toBe(true);
    expect(isRxScreen('drug-register')).toBe(true);
    expect(isRxScreen('nope')).toBe(false);
    expect(isRxScreen(1)).toBe(false);
    expect(isRxFeatureData(null)).toBe(false);
    expect(isRxFeatureData({})).toBe(false);
    expect(
      isRxFeatureData({
        screen: 'queue',
        onSubmit: async () => ({ ok: true }),
      }),
    ).toBe(true);
  });

  it('maps domain error codes and lock copy', () => {
    expect(isRxNotFound('RX_NOT_FOUND')).toBe(true);
    expect(isRxNotFound('FORBIDDEN')).toBe(false);
    expect(isInsufficientStock('INSUFFICIENT_STOCK')).toBe(true);
    expect(isPlanFeatureLocked('PLAN_FEATURE_LOCKED')).toBe(true);
    expect(isPlanFeatureLocked('MODULE_NOT_IN_PLAN')).toBe(true);
    expect(isPlanFeatureLocked('FORBIDDEN')).toBe(false);
    expect(rxLockCopy()).toMatch(/Starter/i);
    expect(RX_STATUS_FILTERS).toContain('PENDING_REVIEW');
    expect(DRUG_REGISTER_SCHEDULE_FILTERS).toContain('H1');
  });

  it('detects controlled schedules', () => {
    expect(isControlledSchedule({ schedule_h1: true })).toBe(true);
    expect(isControlledSchedule({ schedule_x: true })).toBe(true);
    expect(isControlledSchedule({ schedule: 'H1' })).toBe(true);
    expect(isControlledSchedule({ schedule: 'X' })).toBe(true);
    expect(isControlledSchedule({ schedule: 'H' })).toBe(false);
    expect(isControlledSchedule({})).toBe(false);
  });
});

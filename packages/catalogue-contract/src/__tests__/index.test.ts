import { describe, expect, it } from 'vitest';
import {
  CATALOGUE_SCREENS,
  isCatalogueFeatureData,
  isCatalogueScreen,
  isPriceAboveMrp,
  isQueryTooShort,
  isScheduleXOnlineRejected,
  isUuid,
  mappingDisplayName,
  rupeeLabel,
  scheduleDisplayLabel,
} from '../index';

describe('catalogue-contract', () => {
  it('recognises screens and feature payloads', () => {
    expect(CATALOGUE_SCREENS).toContain('search');
    expect(isCatalogueScreen('mapping')).toBe(true);
    expect(isCatalogueScreen('nope')).toBe(false);
    expect(isCatalogueScreen(1)).toBe(false);
    expect(isCatalogueFeatureData(null)).toBe(false);
    expect(isCatalogueFeatureData({})).toBe(false);
    expect(
      isCatalogueFeatureData({
        screen: 'search',
        onSubmit: async () => ({ ok: true }),
      }),
    ).toBe(true);
  });

  it('labels schedules from rules or fallbacks', () => {
    expect(scheduleDisplayLabel(null)).toBe('Unspecified');
    expect(scheduleDisplayLabel('H')).toBe('Schedule H');
    expect(scheduleDisplayLabel('OTC')).toBe('Over-the-counter');
    expect(scheduleDisplayLabel('H1')).toBe('Schedule H1');
    expect(scheduleDisplayLabel('X')).toBe('Schedule X');
    expect(scheduleDisplayLabel('Z')).toBe('Schedule Z');
    expect(
      scheduleDisplayLabel('H', [{ schedule: 'H', full_name: 'Schedule H' }]),
    ).toBe('Schedule H');
  });

  it('maps mapping names, rupees, and domain error codes', () => {
    expect(
      mappingDisplayName({ mapping_id: '1', master_medicine_id: '2' }),
    ).toBe('Medicine');
    expect(
      mappingDisplayName({
        mapping_id: '1',
        master_medicine_id: '2',
        medicine_name: 'Augmentin',
      }),
    ).toBe('Augmentin');
    expect(
      mappingDisplayName({
        mapping_id: '1',
        master_medicine_id: '2',
        name: 'Crocin',
        medicine_name: 'Ignored',
      }),
    ).toBe('Crocin');
    expect(rupeeLabel(undefined)).toBe('—');
    expect(rupeeLabel(Number.NaN)).toBe('—');
    expect(rupeeLabel(21)).toBe('₹21.00');
    expect(isPriceAboveMrp('PRICE_ABOVE_MRP')).toBe(true);
    expect(isPriceAboveMrp('X')).toBe(false);
    expect(isScheduleXOnlineRejected('SCHEDULE_X_NOT_AVAILABLE_ONLINE')).toBe(
      true,
    );
    expect(isQueryTooShort('QUERY_TOO_SHORT')).toBe(true);
    expect(isQueryTooShort('VALIDATION_ERROR')).toBe(true);
    expect(isQueryTooShort('FORBIDDEN')).toBe(false);
    expect(isUuid('11111111-2222-4333-8444-555555555555')).toBe(true);
    expect(isUuid('1')).toBe(false);
    expect(isUuid(1)).toBe(false);
  });
});

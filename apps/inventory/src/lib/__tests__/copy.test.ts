import { describe, expect, it } from 'vitest';
import {
  DETAIL_COPY,
  EXPIRY_COPY,
  LIST_COPY,
  RACKS_COPY,
  SCREEN_COPY,
  daysUntilLabel,
  rootTestId,
  unlocatedHint,
} from '../copy';

describe('inventory copy', () => {
  it('labels screens and chrome', () => {
    expect(SCREEN_COPY.list.title).toMatch(/inventory/i);
    expect(SCREEN_COPY.detail.title).toMatch(/product/i);
    expect(SCREEN_COPY.expiry.title).toMatch(/expiry/i);
    expect(SCREEN_COPY.racks.title).toMatch(/rack/i);
    expect(rootTestId('list')).toBe('inventory-list-page');
    expect(LIST_COPY.empty).toMatch(/catalogue|purchase/i);
    expect(LIST_COPY.sectionTitle).toMatch(/stock/i);
    expect(DETAIL_COPY.confirmWriteOff).toMatch(/write off/i);
    expect(DETAIL_COPY.adjustQuantity).toMatch(/adjusted/i);
    expect(EXPIRY_COPY.alerts).toMatch(/alert/i);
    expect(RACKS_COPY.assign).toMatch(/assign/i);
    expect(RACKS_COPY.zone).toMatch(/zone/i);
    expect(unlocatedHint(1)).toMatch(/1 product/);
    expect(unlocatedHint(3)).toMatch(/3 products/);
    expect(daysUntilLabel(null)).toBe(EXPIRY_COPY.dateUnavailable);
    expect(daysUntilLabel(-2)).toBe(EXPIRY_COPY.expired);
    expect(daysUntilLabel(0)).toBe(EXPIRY_COPY.today);
    expect(daysUntilLabel(1)).toBe('1 day');
    expect(daysUntilLabel(12)).toBe('12 days');
  });
});

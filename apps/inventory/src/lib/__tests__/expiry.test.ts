import { describe, expect, it } from 'vitest';
import { daysUntilExpiry } from '../expiry';

describe('daysUntilExpiry', () => {
  const now = new Date(2026, 7, 29);

  it('returns null for missing or invalid dates', () => {
    expect(daysUntilExpiry(undefined, now)).toBeNull();
    expect(daysUntilExpiry('', now)).toBeNull();
    expect(daysUntilExpiry('not-a-date', now)).toBeNull();
  });

  it('counts calendar days from a date-only ISO string', () => {
    expect(daysUntilExpiry('2026-08-29', now)).toBe(0);
    expect(daysUntilExpiry('2026-08-30', now)).toBe(1);
    expect(daysUntilExpiry('2026-08-28', now)).toBe(-1);
    expect(daysUntilExpiry('2026-09-15', now)).toBe(17);
  });

  it('parses a full timestamp when the prefix is not date-only', () => {
    expect(daysUntilExpiry('15 Sep 2026', now)).not.toBeNull();
  });
});

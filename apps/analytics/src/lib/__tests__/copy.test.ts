import { describe, expect, it } from 'vitest';
import {
  SCREEN_COPY,
  SHARED_COPY,
  TAB_COPY,
  dash,
  errorText,
  favoriteLabel,
  favoriteTestId,
  formatIstDate,
  listOf,
  pageMeta,
  rootTestId,
} from '../copy';

describe('analytics copy', () => {
  it('labels screens and helpers', () => {
    expect(SCREEN_COPY.title).toMatch(/analytics/i);
    expect(TAB_COPY.overview).toMatch(/overview/i);
    expect(TAB_COPY.gst).toMatch(/gst/i);
    expect(rootTestId()).toBe('analytics-analytics-page');
    expect(SHARED_COPY.emptyOverview).toMatch(/period/i);
    expect(errorText({ formError: 'Nope' })).toBe('Nope');
    expect(errorText({ code: 'FORBIDDEN' })).toBe('FORBIDDEN');
    expect(errorText({})).toBe('Unable to continue.');
    expect(dash(null)).toBe('—');
    expect(dash('')).toBe('—');
    expect(dash(12)).toBe('12');
    expect(listOf(undefined)).toEqual([]);
    expect(listOf(['a'])).toEqual(['a']);
    expect(pageMeta(undefined)).toEqual({});
    expect(pageMeta({ page: 2 })).toEqual({ page: 2 });
    expect(formatIstDate('')).toBe('—');
    expect(formatIstDate(null)).toBe('—');
    expect(formatIstDate('not-a-date')).toBe('not-a-date');
    expect(formatIstDate('2026-07-01')).toMatch(/2026|Jul|July|1/);
    expect(formatIstDate('2026-07-01T13:00:00Z')).toMatch(/2026|Jul|July|1/);
    expect(favoriteLabel(true)).toBe(SHARED_COPY.unfavorite);
    expect(favoriteLabel(false)).toBe(SHARED_COPY.favorite);
    expect(favoriteTestId('DAYBOOK')).toBe('analytics-favorite-DAYBOOK');
    expect(favoriteTestId(undefined)).toBe('analytics-favorite-row');
    expect(favoriteTestId(null)).toBe('analytics-favorite-row');
  });
});

import { describe, expect, it } from 'vitest';
import {
  ACTIONS_COPY,
  HOME_COPY,
  QUOTES_COPY,
  SCREEN_COPY,
  dash,
  errorText,
  formatIstDate,
  listOf,
  pageMeta,
  rootTestId,
} from '../copy';

describe('orders copy', () => {
  it('labels screens and helpers', () => {
    expect(SCREEN_COPY['rx-quotes'].title).toMatch(/quote/i);
    expect(SCREEN_COPY['orders-home'].title).toMatch(/order/i);
    expect(SCREEN_COPY['order-actions'].title).toMatch(/action/i);
    expect(rootTestId('rx-quotes')).toBe('orders-rx-quotes-page');
    expect(QUOTES_COPY.empty).toMatch(/quote/i);
    expect(HOME_COPY.empty).toMatch(/order/i);
    expect(ACTIONS_COPY.invalidId).toMatch(/UUID/i);
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
  });
});

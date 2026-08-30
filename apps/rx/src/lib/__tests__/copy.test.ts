import { describe, expect, it } from 'vitest';
import {
  DETAIL_COPY,
  QUEUE_COPY,
  REGISTER_COPY,
  SCREEN_COPY,
  dash,
  errorText,
  formatIstDate,
  listOf,
  pageMeta,
  rootTestId,
  yesNo,
} from '../copy';

describe('rx copy', () => {
  it('labels screens and helpers', () => {
    expect(SCREEN_COPY.queue.title).toMatch(/prescription/i);
    expect(SCREEN_COPY.detail.title).toMatch(/prescription/i);
    expect(SCREEN_COPY['drug-register'].title).toMatch(/register/i);
    expect(rootTestId('queue')).toBe('rx-queue-page');
    expect(QUEUE_COPY.empty).toMatch(/filter/i);
    expect(DETAIL_COPY.notFound).toMatch(/prescription/i);
    expect(REGISTER_COPY.empty).toMatch(/register/i);
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
    expect(yesNo(true)).toBe('Yes');
    expect(yesNo(false)).toBe('No');
    expect(yesNo(null)).toBe('—');
    expect(formatIstDate('')).toBe('—');
    expect(formatIstDate(null)).toBe('—');
    expect(formatIstDate('not-a-date')).toBe('not-a-date');
    expect(formatIstDate('2026-07-01')).toMatch(/2026|Jul|July|1/);
    expect(formatIstDate('2026-07-01T13:00:00Z')).toMatch(/2026|Jul|July|1/);
  });
});

import type { SettlementDetail } from '@medmate/finance-contract';
import { describe, expect, it } from 'vitest';
import {
  DETAIL_COPY,
  LIST_COPY,
  SCREEN_COPY,
  dash,
  errorText,
  formatIstDate,
  listOf,
  pageMeta,
  rootTestId,
} from '../copy';
import { formatFieldValue, presentFields } from '../fields';

describe('finance copy', () => {
  it('labels screens and helpers', () => {
    expect(SCREEN_COPY.settlements.title).toMatch(/settlement/i);
    expect(SCREEN_COPY['settlement-detail'].title).toMatch(/settlement/i);
    expect(rootTestId('settlements')).toBe('finance-settlements-page');
    expect(LIST_COPY.empty).toMatch(/payout/i);
    expect(DETAIL_COPY.notFound).toMatch(/not found/i);
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

  it('omits absent and nested fields', () => {
    expect(presentFields(null)).toEqual([]);
    const fields = presentFields({
      settlement_id: 's-1',
      net_payable: 100,
      gmv: null,
      notes: '',
      status: 'RELEASED',
      lines: [{ amount: 1 }],
    } as SettlementDetail & { lines: { amount: number }[] });
    expect(fields.map((field) => field.key)).toEqual([
      'settlement_id',
      'net_payable',
      'status',
    ]);
    expect(fields.find((field) => field.key === 'gmv')).toBeUndefined();
    expect(formatFieldValue('net_payable', 1300)).toMatch(/1,300/);
    expect(formatFieldValue('released_at', '2026-08-25T04:30:00Z')).toMatch(
      /2026|Aug|August|25/,
    );
    expect(formatFieldValue('commission_pct', 5)).toBe('5');
    expect(formatFieldValue('status', 'RELEASED')).toBe('RELEASED');
  });
});

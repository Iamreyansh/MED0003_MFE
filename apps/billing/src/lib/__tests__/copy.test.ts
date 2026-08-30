import { describe, expect, it } from 'vitest';
import {
  DETAIL_COPY,
  INVOICES_COPY,
  KHATA_COPY,
  KHATA_DETAIL_COPY,
  OFFERS_COPY,
  SALES_COPY,
  SCREEN_COPY,
  SETTINGS_COPY,
  dash,
  errorText,
  formatIstDate,
  listOf,
  pageMeta,
  rootTestId,
  textOrEmpty,
} from '../copy';

describe('billing copy', () => {
  it('labels screens and chrome', () => {
    expect(SCREEN_COPY.invoices.title).toMatch(/invoice/i);
    expect(SCREEN_COPY['invoice-detail'].title).toMatch(/invoice/i);
    expect(SCREEN_COPY['invoice-settings'].title).toMatch(/settings/i);
    expect(SCREEN_COPY.sales.title).toMatch(/ledger/i);
    expect(SCREEN_COPY.khata.title).toMatch(/khata/i);
    expect(SCREEN_COPY['khata-detail'].title).toMatch(/customer/i);
    expect(SCREEN_COPY.offers.title).toMatch(/offer/i);
    expect(KHATA_COPY.empty).toMatch(/outstanding/i);
    expect(KHATA_DETAIL_COPY.notFound).toMatch(/customer/i);
    expect(OFFERS_COPY.empty).toMatch(/offer/i);
    expect(formatIstDate('')).toBe('—');
    expect(formatIstDate(null)).toBe('—');
    expect(formatIstDate('not-a-date')).toBe('not-a-date');
    expect(formatIstDate('2026-07-01')).toMatch(/2026|Jul|July|1/);
    expect(formatIstDate('2026-07-01T13:00:00Z')).toMatch(/2026|Jul|July|1/);
    expect(rootTestId('invoices')).toBe('billing-invoices-page');
    expect(INVOICES_COPY.empty).toMatch(/POS/i);
    expect(DETAIL_COPY.notFound).toMatch(/invoice/i);
    expect(SETTINGS_COPY.dirtyLeave).toMatch(/saved/i);
    expect(SALES_COPY.confirmTitle).toMatch(/payment/i);
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
    expect(textOrEmpty(null)).toBe('');
    expect(textOrEmpty('INV')).toBe('INV');
  });
});

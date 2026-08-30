import { describe, expect, it } from 'vitest';
import {
  CSV_COPY,
  DISTRIBUTORS_COPY,
  EDITOR_COPY,
  PURCHASES_COPY,
  REORDER_COPY,
  SCREEN_COPY,
  dash,
  errorText,
  firstText,
  listOf,
  pageMeta,
  qtyInput,
  rootTestId,
} from '../copy';

describe('procurement copy', () => {
  it('labels screens and chrome', () => {
    expect(SCREEN_COPY.purchases.title).toMatch(/purchase/i);
    expect(SCREEN_COPY.editor.title).toMatch(/grn/i);
    expect(SCREEN_COPY.distributors.title).toMatch(/distributor/i);
    expect(SCREEN_COPY.reorder.title).toMatch(/reorder/i);
    expect(rootTestId('purchases')).toBe('procurement-purchases-page');
    expect(PURCHASES_COPY.empty).toMatch(/grn|import/i);
    expect(CSV_COPY.file).toMatch(/csv/i);
    expect(EDITOR_COPY.saveAndStock).toMatch(/stock/i);
    expect(DISTRIBUTORS_COPY.confirmDelete).toMatch(/delete/i);
    expect(REORDER_COPY.confirmSend).toMatch(/send/i);
    expect(errorText({ formError: 'Nope' })).toBe('Nope');
    expect(errorText({ code: 'FORBIDDEN' })).toBe('FORBIDDEN');
    expect(errorText({})).toBe('Unable to continue.');
    expect(dash(null)).toBe('—');
    expect(dash('')).toBe('—');
    expect(dash(12)).toBe('12');
    expect(firstText(undefined, 'd1')).toBe('d1');
    expect(firstText(null, '', undefined)).toBe('—');
    expect(listOf(undefined)).toEqual([]);
    expect(listOf(['a'])).toEqual(['a']);
    expect(pageMeta(undefined)).toEqual({});
    expect(pageMeta({ page: 2 })).toEqual({ page: 2 });
    expect(qtyInput('3', 1)).toBe('3');
    expect(qtyInput(undefined, null)).toBe('');
    expect(qtyInput(undefined, 4)).toBe('4');
  });
});

import { describe, expect, it } from 'vitest';
import { COUNTER_COPY, SCREEN_COPY, errorText, rootTestId } from '../copy';

describe('pos copy', () => {
  it('labels the counter and maps errors', () => {
    expect(SCREEN_COPY.counter.title).toMatch(/point of sale/i);
    expect(rootTestId('counter')).toBe('pos-counter-page');
    expect(COUNTER_COPY.emptySearch).toMatch(/no products/i);
    expect(COUNTER_COPY.confirmClear).toMatch(/clear/i);
    expect(COUNTER_COPY.discountPercent).toMatch(/percent/i);
    expect(COUNTER_COPY.discountCap).toMatch(/30%/);
    expect(errorText({ formError: 'Check fields' })).toBe('Check fields');
    expect(errorText({ code: 'EMPTY_CART' })).toBe('EMPTY_CART');
    expect(errorText({})).toBe('Unable to continue.');
  });
});

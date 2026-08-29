import { describe, expect, it } from 'vitest';
import { MAPPING_COPY, rootTestId, SCREEN_COPY, SEARCH_COPY } from '../copy';

describe('catalogue copy', () => {
  it('labels screens and search chrome', () => {
    expect(SCREEN_COPY.search.title).toMatch(/search/i);
    expect(SCREEN_COPY.mapping.title).toMatch(/mapping/i);
    expect(rootTestId('search')).toBe('catalogue-search-page');
    expect(SEARCH_COPY.hint).toMatch(/2 characters/);
    expect(MAPPING_COPY.invalidMedicineId).toMatch(/UUID/);
  });
});

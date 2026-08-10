import { describe, expect, it } from 'vitest';
import { DEFAULT_TITLE } from '../mfeConstants';

describe('mfeConstants', () => {
  it('exposes default title', () => {
    expect(DEFAULT_TITLE).toBe('__TITLE__');
  });
});

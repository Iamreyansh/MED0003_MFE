import { describe, expect, it } from 'vitest';
import { isSafeImageUrl } from '../image';

describe('isSafeImageUrl', () => {
  it('accepts http(s) only', () => {
    expect(isSafeImageUrl('https://core.example/rx.png')).toBe(true);
    expect(isSafeImageUrl('http://core.example/rx.png')).toBe(true);
    expect(isSafeImageUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeImageUrl('/local.png')).toBe(false);
    expect(isSafeImageUrl(null)).toBe(false);
  });
});

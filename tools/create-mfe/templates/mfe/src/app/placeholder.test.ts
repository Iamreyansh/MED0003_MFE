import { describe, expect, it } from 'vitest';
import { greeting } from './placeholder';

describe('placeholder', () => {
  it('greets', () => {
    expect(greeting('__TITLE__')).toBe('Hello, __TITLE__');
  });
});

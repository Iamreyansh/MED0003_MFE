import { describe, expect, it } from 'vitest';
import { __NAME__Service } from '../mfeService';

describe('__NAME__Service', () => {
  it('pings', () => {
    expect(__NAME__Service.ping()).toBe('ok');
  });
});

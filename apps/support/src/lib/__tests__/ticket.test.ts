import { describe, expect, it } from 'vitest';
import { canShowCreatorActions } from '../ticket';

describe('ticket helpers', () => {
  it('shows creator actions only for resolved tickets the caller owns', () => {
    expect(canShowCreatorActions(null, 'u-1')).toBe(false);
    expect(canShowCreatorActions({ status: 'OPEN' }, 'u-1')).toBe(false);
    expect(canShowCreatorActions({ status: 'RESOLVED' }, null)).toBe(true);
    expect(
      canShowCreatorActions({ status: 'RESOLVED', customer_id: 'u-1' }, 'u-1'),
    ).toBe(true);
    expect(
      canShowCreatorActions({ status: 'RESOLVED', customer_id: 'u-2' }, 'u-1'),
    ).toBe(false);
  });
});

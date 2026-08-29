import { describe, expect, it } from 'vitest';
import { groupPermissions, sameSet, titleCase } from '../helpers';

describe('roles helpers', () => {
  it('title-cases resource and action codes', () => {
    expect(titleCase('orders')).toBe('Orders');
    expect(titleCase('staff_manage')).toBe('Staff Manage');
    expect(titleCase('night-shift')).toBe('Night Shift');
  });

  it('orders known resources first and appends unknown groups', () => {
    const groups = groupPermissions([
      { permission: 'custom:do', resource: 'custom', action: 'do' },
      { permission: 'orders:read', resource: 'orders', action: 'read' },
    ]);
    expect(groups.map((group) => group.resource)).toEqual(['orders', 'custom']);
  });

  it('compares permission sets by membership', () => {
    expect(sameSet(['a'], ['a', 'b'])).toBe(false);
    expect(sameSet(['a', 'b'], ['b', 'a'])).toBe(true);
    expect(sameSet(['a', 'b'], ['a', 'c'])).toBe(false);
  });
});

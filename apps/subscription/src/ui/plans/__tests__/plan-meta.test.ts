import { describe, expect, it } from 'vitest';
import {
  actionLabel,
  annualCell,
  changeKind,
  monthlyCell,
  planIcon,
  priceLine,
  seatFill,
} from '../plan-meta';

describe('plan-meta', () => {
  it('classifies subscribe, upgrade, downgrade, and no-ops', () => {
    expect(changeKind(null, 'STARTER')).toBe('subscribe');
    expect(changeKind('FREE', 'STARTER')).toBe('subscribe');
    expect(changeKind('FREE', 'FREE')).toBeNull();
    expect(changeKind('STARTER', 'STARTER')).toBeNull();
    expect(changeKind('STARTER', 'RETAIL_PRO')).toBe('upgrade');
    expect(changeKind('RETAIL_PRO', 'STARTER')).toBe('downgrade');
    expect(changeKind('STARTER', null)).toBeNull();
  });

  it('formats prices, seats, and actions', () => {
    expect(
      priceLine({
        id: 'a',
        name: 'STARTER',
        price_monthly_rs: 499,
        price_annual_rs: 4990,
      }),
    ).toBe('Monthly ₹499 · Annual ₹4990');
    expect(priceLine({ id: 'b', name: 'CUSTOM' })).toBe('—');
    expect(
      priceLine({
        id: 'c',
        name: 'ENTERPRISE',
        custom_price: true,
      }),
    ).toBe('Contact us / custom');
    expect(
      monthlyCell({ id: 'd', name: 'STARTER', price_monthly_rs: 10 }),
    ).toBe('₹10');
    expect(monthlyCell({ id: 'e', name: 'CUSTOM' })).toBe('—');
    expect(
      monthlyCell({
        id: 'f',
        name: 'ENTERPRISE',
        price_monthly_rs: null,
        price_annual_rs: null,
      }),
    ).toBe('Contact us / custom');
    expect(annualCell({ id: 'g', name: 'STARTER', price_annual_rs: 100 })).toBe(
      '₹100',
    );
    expect(
      annualCell({
        id: 'h',
        name: 'ENTERPRISE',
        custom_price: true,
      }),
    ).toBe('—');
    expect(annualCell({ id: 'i', name: 'CUSTOM' })).toBe('—');
    expect(seatFill(1)).toEqual([true, false, false, false]);
    expect(seatFill(8)).toEqual([true, true, true, true]);
    expect(actionLabel('subscribe')).toBe('Subscribe');
    expect(actionLabel('upgrade')).toBe('Upgrade');
    expect(actionLabel('downgrade')).toBe('Downgrade');
    expect(actionLabel('cancel')).toBe('Cancel subscription');
  });

  it('picks an icon for known and unknown plans', () => {
    expect(planIcon('FREE').displayName).toBeTruthy();
    expect(planIcon('STARTER').displayName).toBeTruthy();
    expect(planIcon('RETAIL_PRO').displayName).toBeTruthy();
    expect(planIcon('ENTERPRISE').displayName).toBeTruthy();
    expect(planIcon('HOSPITAL').displayName).toBeTruthy();
  });
});

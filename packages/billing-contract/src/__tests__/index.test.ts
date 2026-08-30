import { describe, expect, it } from 'vitest';
import {
  BILLING_SCREENS,
  INVOICE_TEMPLATES,
  MARK_PAID_MODES,
  SHARE_CHANNELS,
  billingLockCopy,
  formatInr,
  isBillingFeatureData,
  isBillingScreen,
  isInvoiceNotFound,
  isPlanFeatureLocked,
  isSaleNotFound,
  isStaffCannotMarkPaid,
} from '../index';

describe('billing-contract', () => {
  it('recognises screens and feature payloads', () => {
    expect(BILLING_SCREENS).toContain('invoices');
    expect(isBillingScreen('sales')).toBe(true);
    expect(isBillingScreen('nope')).toBe(false);
    expect(isBillingScreen(1)).toBe(false);
    expect(isBillingFeatureData(null)).toBe(false);
    expect(isBillingFeatureData({})).toBe(false);
    expect(
      isBillingFeatureData({
        screen: 'invoices',
        onSubmit: async () => ({ ok: true }),
      }),
    ).toBe(true);
  });

  it('maps domain error codes and lock copy', () => {
    expect(isInvoiceNotFound('INVOICE_NOT_FOUND')).toBe(true);
    expect(isSaleNotFound('SALE_NOT_FOUND')).toBe(true);
    expect(isStaffCannotMarkPaid('STAFF_CANNOT_MARK_PAID')).toBe(true);
    expect(isPlanFeatureLocked('PLAN_FEATURE_LOCKED')).toBe(true);
    expect(isPlanFeatureLocked('MODULE_NOT_IN_PLAN')).toBe(true);
    expect(isPlanFeatureLocked('FORBIDDEN')).toBe(false);
    expect(billingLockCopy()).toMatch(/plan/i);
    expect(SHARE_CHANNELS).toEqual(['WHATSAPP', 'SMS', 'EMAIL']);
    expect(MARK_PAID_MODES).toEqual(['CASH', 'UPI', 'CARD']);
    expect(INVOICE_TEMPLATES).toContain('MODERN');
  });

  it('formats rupees', () => {
    expect(formatInr(null)).toBe('—');
    expect(formatInr('x')).toBe('—');
    expect(formatInr(Number.NaN)).toBe('—');
    expect(formatInr(1300)).toMatch(/1,300/);
  });
});

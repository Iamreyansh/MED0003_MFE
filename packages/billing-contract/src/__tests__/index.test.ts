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
  isCustomerNotFound,
  isInvoiceNotFound,
  isOfferNotFound,
  isPlanFeatureLocked,
  isSaleNotFound,
  isStaffCannotMarkPaid,
  isStaffCannotRemind,
  khataLockCopy,
  offersLockCopy,
  REPAY_MODES,
  REMIND_CHANNELS,
  REMIND_TEMPLATES,
} from '../index';

describe('billing-contract', () => {
  it('recognises screens and feature payloads', () => {
    expect(BILLING_SCREENS).toContain('invoices');
    expect(isBillingScreen('sales')).toBe(true);
    expect(isBillingScreen('khata')).toBe(true);
    expect(isBillingScreen('khata-detail')).toBe(true);
    expect(isBillingScreen('offers')).toBe(true);
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
    expect(isCustomerNotFound('CUSTOMER_NOT_FOUND')).toBe(true);
    expect(isStaffCannotRemind('STAFF_CANNOT_REMIND')).toBe(true);
    expect(isOfferNotFound('OFFER_NOT_FOUND')).toBe(true);
    expect(khataLockCopy()).toMatch(/Starter/i);
    expect(offersLockCopy()).toMatch(/Growth/i);
    expect(REPAY_MODES).toEqual(['CASH', 'UPI', 'CARD']);
    expect(REMIND_CHANNELS).toEqual(['WHATSAPP', 'SMS']);
    expect(REMIND_TEMPLATES).toEqual(['POLITE', 'FIRM']);
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

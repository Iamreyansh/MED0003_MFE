import { describe, expect, it } from 'vitest';
import {
  SUBSCRIPTION_SCREENS,
  cancelCopy,
  checkoutHref,
  currentPlanCode,
  downgradeCopy,
  enterprisePriceCopy,
  invoiceAmountLabel,
  invoiceIsPaid,
  isPermissionDeniedCode,
  isPlanLockCode,
  isSubscriptionFeatureData,
  isSubscriptionScreen,
  mapPlanCode,
  minimumPlanForFeature,
  planDisplayLabel,
  planLabelFromUnknown,
  publicPayFields,
} from '../index';

describe('subscription-contract', () => {
  it('recognises screens and feature payloads', () => {
    expect(SUBSCRIPTION_SCREENS).toContain('plans');
    expect(isSubscriptionScreen('billing')).toBe(true);
    expect(isSubscriptionScreen('nope')).toBe(false);
    expect(isSubscriptionScreen(1)).toBe(false);
    expect(isSubscriptionFeatureData(null)).toBe(false);
    expect(isSubscriptionFeatureData({})).toBe(false);
    expect(
      isSubscriptionFeatureData({
        screen: 'plans',
        onSubmit: async () => ({ ok: true }),
      }),
    ).toBe(true);
  });

  it('maps plan enums to display labels', () => {
    expect(planDisplayLabel('FREE')).toBe('Free');
    expect(planDisplayLabel('STARTER')).toBe('Starter');
    expect(planDisplayLabel('RETAIL_PRO')).toBe('Growth');
    expect(planDisplayLabel('ENTERPRISE')).toBe('Pro');
    expect(mapPlanCode('GROWTH')).toBe('RETAIL_PRO');
    expect(mapPlanCode('PRO')).toBe('ENTERPRISE');
    expect(mapPlanCode('nope')).toBeNull();
    expect(planLabelFromUnknown('RETAIL_PRO')).toBe('Growth');
    expect(planLabelFromUnknown('Custom')).toBe('Custom');
    expect(planLabelFromUnknown(null)).toBe('Unknown');
    expect(planLabelFromUnknown('  ')).toBe('Unknown');
    expect(currentPlanCode(null)).toBeNull();
    expect(currentPlanCode({ current_plan: 'STARTER' })).toBe('STARTER');
    expect(currentPlanCode({ plan: 'FREE' })).toBe('FREE');
  });

  it('distinguishes plan locks from permission denials', () => {
    expect(isPlanLockCode('PLAN_FEATURE_LOCKED')).toBe(true);
    expect(isPlanLockCode('PLAN_UPGRADE_REQUIRED')).toBe(true);
    expect(isPlanLockCode('MODULE_NOT_IN_PLAN')).toBe(true);
    expect(isPlanLockCode('INSUFFICIENT_PERMISSIONS')).toBe(false);
    expect(isPermissionDeniedCode('INSUFFICIENT_PERMISSIONS')).toBe(true);
    expect(isPermissionDeniedCode('FORBIDDEN')).toBe(true);
    expect(minimumPlanForFeature('khata')).toBe('STARTER');
    expect(minimumPlanForFeature('rx_queue')).toBe('STARTER');
    expect(minimumPlanForFeature('analytics')).toBe('RETAIL_PRO');
    expect(minimumPlanForFeature('distributors')).toBe('RETAIL_PRO');
    expect(minimumPlanForFeature('online_visibility')).toBe('RETAIL_PRO');
  });

  it('keeps downgrade and cancel copy honest', () => {
    expect(downgradeCopy()).toMatch(/next renewal/);
    expect(cancelCopy()).toMatch(/Growth/);
  });

  it('uses Contact us for Enterprise custom or null prices', () => {
    expect(
      enterprisePriceCopy({
        id: 'ent',
        name: 'ENTERPRISE',
        price_monthly_rs: null,
        custom_price: true,
      }),
    ).toBe('Contact us / custom');
    expect(
      enterprisePriceCopy({
        id: 'ent',
        name: 'ENTERPRISE',
        price_monthly_rs: 2999,
        price_annual_rs: 29990,
      }),
    ).toBeNull();
    expect(enterprisePriceCopy({ id: 'free', name: 'FREE' })).toBeNull();
  });

  it('keeps only public Cashfree fields and prefers a checkout URL', () => {
    expect(
      publicPayFields({
        payment_link: 'https://payments.example/pay',
        cashfree_secret: 'nope',
        payment_session_id: 'sess_1',
        order_id: 'ord_1',
      }),
    ).toEqual({
      payment_link: 'https://payments.example/pay',
      payment_session_id: 'sess_1',
      order_id: 'ord_1',
    });
    expect(publicPayFields(null)).toEqual({});
    expect(checkoutHref({ payment_link: 'https://pay.example/a' })).toBe(
      'https://pay.example/a',
    );
    expect(checkoutHref({ checkout_url: 'https://pay.example/b' })).toBe(
      'https://pay.example/b',
    );
    expect(checkoutHref({ payment_session_id: 'sess' })).toBeNull();
    expect(checkoutHref(undefined)).toBeNull();
    expect(publicPayFields([])).toEqual({});
    expect(publicPayFields({ payment_link: 1 })).toEqual({});
  });

  it('formats invoice amounts from rs or paise', () => {
    expect(invoiceAmountLabel({ id: '1', amount_rs: 499 })).toBe('₹499');
    expect(invoiceAmountLabel({ id: '2', amount_paise: 49900 })).toBe(
      '₹499.00',
    );
    expect(invoiceAmountLabel({ id: '3' })).toBe('—');
    expect(invoiceIsPaid({ id: '1', status: 'PAID' })).toBe(true);
    expect(invoiceIsPaid({ id: '2', status: 'unpaid' })).toBe(false);
    expect(invoiceIsPaid(null)).toBe(false);
    expect(invoiceIsPaid({ id: '3', paid_at: '2026-08-01' })).toBe(true);
  });
});

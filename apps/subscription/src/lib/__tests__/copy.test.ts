import { describe, expect, it } from 'vitest';
import { SCREEN_COPY, rootTestId } from '../copy';

describe('subscription copy', () => {
  it('labels screens', () => {
    expect(SCREEN_COPY.plans.title).toBe('Subscription');
    expect(SCREEN_COPY.plans.kicker).toBe('Plan index');
    expect(SCREEN_COPY.billing.title).toBe('SaaS billing');
    expect(SCREEN_COPY.billing.kicker).toBe('Statement');
    expect(rootTestId('plans')).toBe('subscription-plans-page');
    expect(rootTestId('billing')).toBe('subscription-billing-page');
  });
});

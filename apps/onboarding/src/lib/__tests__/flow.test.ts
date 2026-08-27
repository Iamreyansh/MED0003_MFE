import { describe, expect, it } from 'vitest';
import { FLOW_STEPS, flowIndex, flowState, statusProgressStep } from '../flow';

describe('onboarding flow', () => {
  it('maps screens to rail indexes', () => {
    expect(FLOW_STEPS).toHaveLength(4);
    expect(flowIndex('register')).toBe(0);
    expect(flowIndex('verify')).toBe(1);
    expect(flowIndex('kyc')).toBe(2);
    expect(flowIndex('status')).toBe(3);
    expect(flowIndex('nope' as never)).toBe(0);
  });

  it('marks steps done, current, or upcoming', () => {
    expect(flowState(0, 2)).toBe('done');
    expect(flowState(2, 2)).toBe('current');
    expect(flowState(3, 2)).toBe('upcoming');
  });

  it('derives status progress', () => {
    expect(statusProgressStep('ACTIVE', false)).toBe(3);
    expect(statusProgressStep('KYC_SUBMITTED', true)).toBe(2);
    expect(statusProgressStep('REJECTED', true)).toBe(2);
    expect(statusProgressStep('PENDING_KYC', true)).toBe(1);
    expect(statusProgressStep('PENDING_KYC', false)).toBe(0);
    expect(statusProgressStep('SUSPENDED', true)).toBe(0);
    expect(statusProgressStep(undefined, undefined)).toBe(0);
  });
});

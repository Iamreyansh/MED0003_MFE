import { describe, expect, it } from 'vitest';
import {
  documentTypeLabel,
  isAttentionStatus,
  rootTestId,
  statusLabel,
} from '../copy';
import { focusFirstError, formatIst } from '../focus';

describe('onboarding copy', () => {
  it('maps screens and labels', () => {
    expect(rootTestId('register')).toBe('register-page');
    expect(rootTestId('verify')).toBe('register-verify-page');
    expect(rootTestId('status')).toBe('onboarding-status-page');
    expect(rootTestId('kyc')).toBe('onboarding-kyc-page');
    expect(documentTypeLabel('GSTIN_CERTIFICATE')).toBe('GSTIN certificate');
    expect(documentTypeLabel('CUSTOM_TYPE')).toBe('CUSTOM TYPE');
    expect(statusLabel('PENDING_KYC')).toBe('Pending KYC');
    expect(statusLabel('OTHER')).toBe('OTHER');
    expect(isAttentionStatus('REJECTED')).toBe(true);
    expect(isAttentionStatus('SUSPENDED')).toBe(true);
    expect(isAttentionStatus('ACTIVE')).toBe(false);
  });
});

describe('focus and IST helpers', () => {
  it('focuses the first named control', () => {
    document.body.innerHTML =
      '<form><input name="email" /><input name="phone" /></form>';
    focusFirstError(document.querySelector('form'), { phone: 'Required' });
    expect(document.activeElement).toBe(
      document.querySelector('input[name="phone"]'),
    );
    focusFirstError(null, { email: 'x' });
    focusFirstError(document.querySelector('form'), {});
    document.body.innerHTML = '<form><input id="otp" /></form>';
    focusFirstError(document.querySelector('form'), { otp: 'Required' });
    expect(document.activeElement).toBe(document.querySelector('#otp'));
  });

  it('formats IST timestamps', () => {
    expect(formatIst(undefined)).toBe('—');
    expect(formatIst('')).toBe('—');
    expect(formatIst('not-a-date')).toBe('not-a-date');
    expect(formatIst('2026-08-26T12:00:00.000Z')).toMatch(/2026/);
  });
});

import { describe, expect, it } from 'vitest';
import {
  KYC_DOCUMENT_TYPES,
  ONBOARDING_SCREENS,
  isKycDocumentType,
  isOnboardingFeatureData,
  isOnboardingScreen,
  isValidEmail,
  isValidFssai,
  isValidGstin,
  isValidOtp,
  isValidPan,
  isValidPassword,
  isValidPhone,
  isValidPincode,
  normalizeEmail,
  normalizePhone,
} from '../index';

describe('onboarding-contract', () => {
  it('recognises screens', () => {
    expect(ONBOARDING_SCREENS).toContain('register');
    expect(isOnboardingScreen('kyc')).toBe(true);
    expect(isOnboardingScreen('nope')).toBe(false);
    expect(isOnboardingScreen(1)).toBe(false);
  });

  it('validates feature payloads', () => {
    expect(isOnboardingFeatureData(null)).toBe(false);
    expect(isOnboardingFeatureData({})).toBe(false);
    expect(
      isOnboardingFeatureData({
        screen: 'register',
        onSubmit: async () => ({ ok: true }),
      }),
    ).toBe(true);
    expect(
      isOnboardingFeatureData({
        screen: 'nope',
        onSubmit: async () => ({ ok: true }),
      }),
    ).toBe(false);
  });

  it('validates India registration fields', () => {
    expect(normalizeEmail('  A@B.C  ')).toBe('a@b.c');
    expect(normalizePhone('+91 98765 43210')).toBe('+919876543210');
    expect(isValidEmail('priya@srirama.in')).toBe(true);
    expect(isValidEmail('nope')).toBe(false);
    expect(isValidPhone('+919876543210')).toBe(true);
    expect(isValidPhone('9876543210')).toBe(false);
    expect(isValidOtp('123456')).toBe(true);
    expect(isValidOtp('12')).toBe(false);
    expect(isValidPassword('Passw0rd!')).toBe(true);
    expect(isValidPassword('password')).toBe(false);
    expect(isValidPincode('560001')).toBe(true);
    expect(isValidPincode('056001')).toBe(false);
    expect(isValidPan('AABPP1234F')).toBe(true);
    expect(isValidPan('bad')).toBe(false);
    expect(isValidGstin('29AABPP1234F1Z5')).toBe(true);
    expect(isValidGstin('GSTIN')).toBe(false);
    expect(isValidFssai('12345678901234')).toBe(true);
    expect(isValidFssai('123')).toBe(false);
    expect(isKycDocumentType('GSTIN_CERTIFICATE')).toBe(true);
    expect(isKycDocumentType('OTHER')).toBe(false);
    expect(KYC_DOCUMENT_TYPES).toHaveLength(6);
  });
});

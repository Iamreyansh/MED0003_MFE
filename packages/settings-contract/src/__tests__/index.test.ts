import { describe, expect, it } from 'vitest';
import {
  SETTINGS_SCREENS,
  STOREFRONT_EVENT,
  completenessSectionId,
  isSettingsFeatureData,
  isSettingsScreen,
  isValidAccountNumber,
  isValidEmail,
  isValidFssai,
  isValidGstin,
  isValidIfsc,
  isValidOtp,
  isValidPan,
  isValidPhone,
  isValidPincode,
  normalizeEmail,
  normalizePhone,
} from '../index';

describe('settings-contract', () => {
  it('recognises screens', () => {
    expect(SETTINGS_SCREENS).toContain('profile');
    expect(isSettingsScreen('storefront')).toBe(true);
    expect(isSettingsScreen('nope')).toBe(false);
    expect(isSettingsScreen(1)).toBe(false);
    expect(STOREFRONT_EVENT).toBe('pharmacy.storefront');
  });

  it('validates feature payloads', () => {
    expect(isSettingsFeatureData(null)).toBe(false);
    expect(isSettingsFeatureData({})).toBe(false);
    expect(
      isSettingsFeatureData({
        screen: 'profile',
        onSubmit: async () => ({ ok: true }),
      }),
    ).toBe(true);
    expect(
      isSettingsFeatureData({
        screen: 'nope',
        onSubmit: async () => ({ ok: true }),
      }),
    ).toBe(false);
  });

  it('validates India profile fields', () => {
    expect(normalizeEmail('  A@B.C  ')).toBe('a@b.c');
    expect(normalizePhone('+91 98765 43210')).toBe('+919876543210');
    expect(isValidEmail('priya@srirama.in')).toBe(true);
    expect(isValidEmail('nope')).toBe(false);
    expect(isValidPhone('+919876543210')).toBe(true);
    expect(isValidPhone('9876543210')).toBe(false);
    expect(isValidOtp('123456')).toBe(true);
    expect(isValidOtp('12')).toBe(false);
    expect(isValidPincode('560001')).toBe(true);
    expect(isValidPincode('056001')).toBe(false);
    expect(isValidPan('AABPP1234F')).toBe(true);
    expect(isValidPan('bad')).toBe(false);
    expect(isValidGstin('29AABPP1234F1Z5')).toBe(true);
    expect(isValidGstin('GSTIN')).toBe(false);
    expect(isValidFssai('12345678901234')).toBe(true);
    expect(isValidFssai('123')).toBe(false);
    expect(isValidIfsc('HDFC0001234')).toBe(true);
    expect(isValidIfsc('bad')).toBe(false);
    expect(isValidAccountNumber('123456789012')).toBe(true);
    expect(isValidAccountNumber('12')).toBe(false);
  });

  it('maps completeness fields to section ids', () => {
    expect(completenessSectionId('gstin')).toBe('section-tax');
    expect(completenessSectionId('bank_account')).toBe('section-bank');
    expect(completenessSectionId('unknown_field')).toBe('section-identity');
  });
});

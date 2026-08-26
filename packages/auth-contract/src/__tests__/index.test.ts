import { describe, expect, it } from 'vitest';
import {
  AUTH_PORTAL_TYPES,
  isAuthFeatureData,
  isAuthPortalType,
  isUuid,
  isValidEmail,
  isValidIdentifier,
  isValidOtp,
  isValidPassword,
  isValidPhone,
  isValidPin,
  normalizeIdentifier,
} from '../index';

describe('auth-contract', () => {
  it('recognises portal types', () => {
    expect(AUTH_PORTAL_TYPES).toContain('pharmacy');
    expect(isAuthPortalType('pharmacy')).toBe(true);
    expect(isAuthPortalType('pos')).toBe(true);
    expect(isAuthPortalType('unknown')).toBe(false);
    expect(isAuthPortalType(1)).toBe(false);
  });

  it('validates feature payloads', () => {
    expect(isAuthFeatureData(null)).toBe(false);
    expect(isAuthFeatureData({})).toBe(false);
    expect(
      isAuthFeatureData({
        portalType: 'pharmacy',
        onSubmit: async () => ({ ok: true }),
      }),
    ).toBe(true);
    expect(
      isAuthFeatureData({
        portalType: 'nope',
        onSubmit: async () => ({ ok: true }),
      }),
    ).toBe(false);
  });

  it('normalises and validates identifiers', () => {
    expect(normalizeIdentifier('  A@B.C  ')).toBe('a@b.c');
    expect(normalizeIdentifier('+91 98765 43210')).toBe('+919876543210');
    expect(isValidIdentifier('priya@srirama.in')).toBe(true);
    expect(isValidIdentifier('+919876543210')).toBe(true);
    expect(isValidIdentifier('+911234567890')).toBe(false);
    expect(isValidIdentifier('not-an-id')).toBe(false);
    expect(isValidIdentifier('priya@bad')).toBe(false);
    expect(isValidPhone('+919876543210')).toBe(true);
    expect(isValidPhone('9876543210')).toBe(false);
    expect(isValidEmail('a@b.c')).toBe(true);
    expect(isValidEmail('nope')).toBe(false);
    expect(isUuid('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe(true);
    expect(isUuid('nope')).toBe(false);
    expect(isValidOtp('123456')).toBe(true);
    expect(isValidOtp('12')).toBe(false);
    expect(isValidPin('1234')).toBe(true);
    expect(isValidPin('12')).toBe(false);
    expect(isValidPassword('Secret12')).toBe(true);
    expect(isValidPassword('short')).toBe(false);
  });
});

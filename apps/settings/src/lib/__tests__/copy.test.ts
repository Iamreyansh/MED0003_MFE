import { describe, expect, it } from 'vitest';
import {
  KYC_PENDING_STATUSES,
  PROFILE_NAV,
  profileStatusLabel,
  rootTestId,
  SCREEN_COPY,
  storefrontStatusLabel,
} from '../copy';
import { boolOrFalse, focusFirstError, textOrEmpty } from '../focus';

describe('settings copy', () => {
  it('labels screens', () => {
    expect(SCREEN_COPY.profile.title).toMatch(/profile/i);
    expect(rootTestId('profile')).toBe('settings-profile-page');
    expect(rootTestId('storefront')).toBe('settings-storefront-page');
    expect(KYC_PENDING_STATUSES.has('PENDING_KYC')).toBe(true);
    expect(PROFILE_NAV[0]?.id).toBe('section-completeness');
  });

  it('maps pharmacy and storefront status chips', () => {
    expect(profileStatusLabel()).toBeUndefined();
    expect(profileStatusLabel('ACTIVE')).toBe('Active');
    expect(profileStatusLabel('UNKNOWN_STATE')).toBe('UNKNOWN_STATE');
    expect(
      storefrontStatusLabel({ pharmacyStatus: 'SUSPENDED', isOnline: true }),
    ).toBe('Suspended');
    expect(
      storefrontStatusLabel({ adminForcedOffline: true, isOnline: true }),
    ).toBe('Forced offline');
    expect(storefrontStatusLabel({ isOnline: true })).toBe('Online');
    expect(storefrontStatusLabel({ isOnline: false })).toBe('Offline');
    expect(storefrontStatusLabel({ isOnline: null })).toBe('Unknown');
  });
});

describe('focus helpers', () => {
  it('focuses the first named error', () => {
    const root = document.createElement('form');
    const input = document.createElement('input');
    input.setAttribute('name', 'gstin');
    root.appendChild(input);
    document.body.appendChild(root);
    focusFirstError(null, { gstin: 'bad' });
    focusFirstError(root, {});
    focusFirstError(root, { gstin: 'bad' });
    expect(document.activeElement).toBe(input);
    root.remove();
  });

  it('falls back to an id selector', () => {
    const root = document.createElement('form');
    const input = document.createElement('input');
    input.id = 'otp';
    root.appendChild(input);
    document.body.appendChild(root);
    focusFirstError(root, { otp: 'bad' });
    expect(document.activeElement).toBe(input);
    root.remove();
  });

  it('normalises empty values', () => {
    expect(textOrEmpty(undefined)).toBe('');
    expect(textOrEmpty('x')).toBe('x');
    expect(boolOrFalse(true)).toBe(true);
    expect(boolOrFalse(false)).toBe(false);
  });
});

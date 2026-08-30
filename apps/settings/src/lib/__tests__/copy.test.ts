import { describe, expect, it } from 'vitest';
import {
  assignedStaffLabel,
  KYC_PENDING_STATUSES,
  NOTIFICATIONS_COPY,
  preferenceLabel,
  PROFILE_NAV,
  profileStatusLabel,
  ROLES_COPY,
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
    expect(rootTestId('roles')).toBe('settings-roles-page');
    expect(rootTestId('notifications')).toBe('settings-notifications-page');
    expect(SCREEN_COPY.roles.title).toBe('Roles');
    expect(SCREEN_COPY.notifications.title).toBe('Notifications');
    expect(preferenceLabel('sms')).toBe('SMS');
    expect(preferenceLabel('order_alerts')).toBe('Order alerts');
    expect(preferenceLabel('custom_digest')).toBe('Custom digest');
    expect(NOTIFICATIONS_COPY.save).toBe('Save preferences');
    expect(ROLES_COPY.kpiSystem).toBe('System roles');
    expect(ROLES_COPY.emptyCustom).toMatch(/custom roles/i);
    expect(assignedStaffLabel(0)).toBe('0 staff');
    expect(assignedStaffLabel(2)).toBe('2 staff');
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

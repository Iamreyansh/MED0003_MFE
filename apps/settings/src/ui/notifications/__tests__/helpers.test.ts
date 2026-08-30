import { describe, expect, it } from 'vitest';
import {
  changedSubset,
  draftFromPayload,
  enabledMap,
  isDraftDirty,
  toggleDisabled,
} from '../helpers';

const payload = {
  channels: {
    push: { enabled: true, can_disable: true },
    sms: { enabled: true, can_disable: true },
    whatsapp: {
      enabled: false,
      can_disable: false,
      status: 'CHANNEL_UNAVAILABLE',
    },
  },
  categories: {
    order_alerts: { enabled: true, can_disable: false },
    low_stock_alerts: { enabled: true, can_disable: true },
  },
};

describe('notification helpers', () => {
  it('maps enabled flags without inventing keys', () => {
    expect(enabledMap(payload.channels)).toEqual({
      push: true,
      sms: true,
      whatsapp: false,
    });
    expect(enabledMap(undefined)).toEqual({});
    expect(draftFromPayload(payload).categories).toEqual({
      order_alerts: true,
      low_stock_alerts: true,
    });
  });

  it('detects dirty drafts and changed subsets', () => {
    const baseline = draftFromPayload(payload);
    expect(isDraftDirty(null, baseline)).toBe(false);
    expect(isDraftDirty(baseline, baseline)).toBe(false);
    const draft = {
      ...baseline,
      channels: { ...baseline.channels, sms: false },
    };
    expect(isDraftDirty(baseline, draft)).toBe(true);
    expect(changedSubset(baseline.channels, draft.channels)).toEqual({
      sms: false,
    });
    expect(
      changedSubset(baseline.categories, baseline.categories),
    ).toBeUndefined();
  });

  it('locks unavailable, mandatory, and staff toggles', () => {
    expect(toggleDisabled(payload.channels.whatsapp, true, false)).toBe(true);
    expect(toggleDisabled(payload.categories.order_alerts, true, false)).toBe(
      true,
    );
    expect(toggleDisabled(payload.channels.push, false, false)).toBe(true);
    expect(toggleDisabled(payload.channels.push, true, true)).toBe(true);
    expect(toggleDisabled(payload.channels.push, true, false)).toBe(false);
  });
});

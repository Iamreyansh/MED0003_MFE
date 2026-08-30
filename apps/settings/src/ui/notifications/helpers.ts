import type {
  NotificationPreferencesPayload,
  PreferenceToggle,
} from '@medmate/settings-contract';

export type PreferenceDraft = {
  channels: Record<string, boolean>;
  categories: Record<string, boolean>;
};

export function enabledMap(
  group: Record<string, PreferenceToggle> | undefined,
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const [key, toggle] of Object.entries(group ?? {})) {
    out[key] = Boolean(toggle.enabled);
  }
  return out;
}

export function draftFromPayload(
  payload: NotificationPreferencesPayload,
): PreferenceDraft {
  return {
    channels: enabledMap(payload.channels),
    categories: enabledMap(payload.categories),
  };
}

export function isDraftDirty(
  baseline: PreferenceDraft | null,
  draft: PreferenceDraft | null,
): boolean {
  if (!baseline || !draft) {
    return false;
  }
  return (
    !sameEnabled(baseline.channels, draft.channels) ||
    !sameEnabled(baseline.categories, draft.categories)
  );
}

export function changedSubset(
  baseline: Record<string, boolean>,
  draft: Record<string, boolean>,
): Record<string, boolean> | undefined {
  const out: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(draft)) {
    if (baseline[key] !== value) {
      out[key] = value;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export function toggleDisabled(
  toggle: PreferenceToggle,
  canWrite: boolean,
  formDisabled?: boolean,
): boolean {
  if (!canWrite || formDisabled) {
    return true;
  }
  if (toggle.status === 'CHANNEL_UNAVAILABLE') {
    return true;
  }
  return !toggle.can_disable;
}

function sameEnabled(
  left: Record<string, boolean>,
  right: Record<string, boolean>,
): boolean {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of keys) {
    if (left[key] !== right[key]) {
      return false;
    }
  }
  return true;
}

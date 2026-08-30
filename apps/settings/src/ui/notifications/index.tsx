import type {
  NotificationPreferencesPayload,
  PreferenceToggle,
  SettingsFeatureData,
} from '@medmate/settings-contract';
import { Button, Spinner, Stack, StatusMessage, Text } from '@medmate/ui';
import { Bell, Radio } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { NOTIFICATIONS_COPY, preferenceLabel } from '../../lib/copy';
import { CheckboxField } from '../shared/checkbox-field';
import { DirtyLeaveGuard } from '../shared/dirty-leave';
import { FormBanner } from '../shared/form-error';
import { SectionBlock } from '../shared/section-block';
import {
  changedSubset,
  draftFromPayload,
  isDraftDirty,
  toggleDisabled,
  type PreferenceDraft,
} from './helpers';

export function NotificationsScreen({
  feature,
  onNavigate,
}: {
  feature: SettingsFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const canWrite = Boolean(feature.canWrite);
  const [payload, setPayload] = useState<NotificationPreferencesPayload | null>(
    null,
  );
  const [baseline, setBaseline] = useState<PreferenceDraft>({
    channels: {},
    categories: {},
  });
  const [draft, setDraft] = useState<PreferenceDraft>({
    channels: {},
    categories: {},
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const dirty = isDraftDirty(baseline, draft);
  const channelKeys = Object.keys(payload?.channels ?? {}).filter(
    (key) => payload?.channels[key],
  );
  const categoryKeys = Object.keys(payload?.categories ?? {}).filter(
    (key) => payload?.categories[key],
  );
  const empty =
    !loading && channelKeys.length === 0 && categoryKeys.length === 0;

  const loadPreferences = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    setFieldErrors({});
    const result = await feature.onSubmit({
      screen: 'notifications',
      action: 'load',
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.formError ?? result.code ?? NOTIFICATIONS_COPY.loadError);
      return;
    }
    const next = result.preferences ?? { channels: {}, categories: {} };
    const nextDraft = draftFromPayload(next);
    setPayload(next);
    setBaseline(nextDraft);
    setDraft(nextDraft);
  }, [feature]);

  useEffect(() => {
    void loadPreferences();
  }, [loadPreferences]);

  const helperByKey = useMemo(() => {
    const out: Record<string, string> = {};
    for (const [key, toggle] of Object.entries(payload?.channels ?? {})) {
      if (toggle.status === 'CHANNEL_UNAVAILABLE') {
        out[key] = NOTIFICATIONS_COPY.unavailable;
      }
    }
    for (const [key, toggle] of Object.entries(payload?.categories ?? {})) {
      if (!toggle.can_disable) {
        out[key] = NOTIFICATIONS_COPY.mandatory;
      }
    }
    return out;
  }, [payload]);

  function setGroup(
    group: 'channels' | 'categories',
    key: string,
    enabled: boolean,
  ) {
    setDraft((current) => ({
      channels:
        group === 'channels'
          ? { ...current.channels, [key]: enabled }
          : current.channels,
      categories:
        group === 'categories'
          ? { ...current.categories, [key]: enabled }
          : current.categories,
    }));
  }

  async function save() {
    const channels = changedSubset(baseline.channels, draft.channels);
    const categories = changedSubset(baseline.categories, draft.categories);
    setBusy(true);
    setError(undefined);
    setFieldErrors({});
    const result = await feature.onSubmit({
      screen: 'notifications',
      action: 'save',
      values: { channels, categories },
    });
    setBusy(false);
    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {});
      setError(result.formError ?? result.code ?? NOTIFICATIONS_COPY.forbidden);
      return;
    }
    await loadPreferences();
  }

  if (loading) {
    return <Spinner block label="Loading notification preferences" />;
  }

  return (
    <Stack gap="4" data-testid="notifications-panel">
      <DirtyLeaveGuard
        dirty={dirty}
        onNavigate={onNavigate}
        description={NOTIFICATIONS_COPY.dirtyLeave}
      />
      <FormBanner message={error} testId="notifications-error" />
      {empty ? (
        <StatusMessage data-testid="notifications-empty">
          {NOTIFICATIONS_COPY.empty}
        </StatusMessage>
      ) : null}
      {channelKeys.length > 0 ? (
        <SectionBlock
          id="section-channels"
          title={NOTIFICATIONS_COPY.channelsTitle}
          hint={NOTIFICATIONS_COPY.channelsHint}
          icon={Radio}
        >
          <Stack gap="3">
            {channelKeys.map((key) =>
              renderToggle({
                group: 'channels',
                key,
                toggle: payload!.channels[key]!,
                checked: Boolean(draft.channels[key]),
                canWrite,
                disabled: feature.disabled,
                helper: helperByKey[key],
                fieldError: fieldErrors[key],
                onChange: (enabled) => setGroup('channels', key, enabled),
              }),
            )}
          </Stack>
        </SectionBlock>
      ) : null}
      {categoryKeys.length > 0 ? (
        <SectionBlock
          id="section-categories"
          title={NOTIFICATIONS_COPY.categoriesTitle}
          hint={NOTIFICATIONS_COPY.categoriesHint}
          icon={Bell}
          footer={
            canWrite ? (
              <Button
                type="button"
                disabled={busy || !dirty || feature.disabled}
                onClick={() => {
                  void save();
                }}
              >
                {NOTIFICATIONS_COPY.save}
              </Button>
            ) : undefined
          }
        >
          <Stack gap="3">
            {categoryKeys.map((key) =>
              renderToggle({
                group: 'categories',
                key,
                toggle: payload!.categories[key]!,
                checked: Boolean(draft.categories[key]),
                canWrite,
                disabled: feature.disabled,
                helper: helperByKey[key],
                fieldError: fieldErrors[key],
                onChange: (enabled) => setGroup('categories', key, enabled),
              }),
            )}
          </Stack>
        </SectionBlock>
      ) : canWrite && channelKeys.length > 0 ? (
        <Button
          type="button"
          disabled={busy || !dirty || feature.disabled}
          onClick={() => {
            void save();
          }}
        >
          {NOTIFICATIONS_COPY.save}
        </Button>
      ) : null}
      {!canWrite ? (
        <StatusMessage data-testid="notifications-staff">
          {NOTIFICATIONS_COPY.staffView}
        </StatusMessage>
      ) : null}
    </Stack>
  );
}

function renderToggle({
  group,
  key,
  toggle,
  checked,
  canWrite,
  disabled,
  helper,
  fieldError,
  onChange,
}: {
  group: 'channels' | 'categories';
  key: string;
  toggle: PreferenceToggle;
  checked: boolean;
  canWrite: boolean;
  disabled?: boolean;
  helper?: string;
  fieldError?: string;
  onChange: (enabled: boolean) => void;
}) {
  const id = `${group}-${key}`;
  const locked = toggleDisabled(toggle, canWrite, disabled);
  return (
    <Stack key={id} gap="1">
      <CheckboxField
        id={id}
        name={key}
        label={preferenceLabel(key)}
        checked={checked}
        disabled={locked}
        onChange={onChange}
      />
      {helper ? (
        <Text size="sm" tone="muted" id={`${id}-hint`}>
          {helper}
        </Text>
      ) : null}
      {fieldError ? (
        <Text size="sm" tone="error" role="alert">
          {fieldError}
        </Text>
      ) : null}
    </Stack>
  );
}

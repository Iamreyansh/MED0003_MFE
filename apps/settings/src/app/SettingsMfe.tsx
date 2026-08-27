import { assertMfeDataEnvelope } from '@medmate/contracts';
import { isSettingsFeatureData } from '@medmate/settings-contract';
import { StatusMessage } from '@medmate/ui';
import type { SettingsMfeProps } from '../contract';
import { SettingsLayout } from '../layouts/SettingsLayout';

export default function SettingsMfe({ data }: SettingsMfeProps) {
  assertMfeDataEnvelope(data);
  if (!isSettingsFeatureData(data.feature)) {
    return (
      <StatusMessage tone="error" data-testid="settings-contract-error">
        Settings module is missing a screen.
      </StatusMessage>
    );
  }
  return <SettingsLayout data={data} />;
}

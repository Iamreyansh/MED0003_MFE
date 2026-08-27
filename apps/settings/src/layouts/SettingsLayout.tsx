import { isSettingsScreen } from '@medmate/settings-contract';
import { Box, StatusMessage } from '@medmate/ui';
import type { SettingsMfeProps } from '../contract';
import {
  profileStatusLabel,
  rootTestId,
  SCREEN_COPY,
  storefrontStatusLabel,
} from '../lib/copy';
import { ProfileScreen } from '../ui/profile';
import { PageHeader } from '../ui/shared/page-header';
import { StorefrontScreen } from '../ui/storefront';

export function SettingsLayout({ data }: SettingsMfeProps) {
  const feature = data.feature;
  if (!isSettingsScreen(feature.screen)) {
    return <StatusMessage tone="error">Unknown settings screen.</StatusMessage>;
  }
  const copy = SCREEN_COPY[feature.screen];
  const badge =
    feature.screen === 'profile'
      ? profileStatusLabel(feature.pharmacyStatus)
      : storefrontStatusLabel({
          pharmacyStatus: feature.pharmacyStatus,
          adminForcedOffline: feature.adminForcedOffline,
          isOnline: feature.isOnline,
        });
  return (
    <Box data-testid={rootTestId(feature.screen)} className="w-full">
      <PageHeader title={copy.title} helper={copy.helper} badge={badge} />
      {feature.screen === 'profile' ? (
        <ProfileScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : (
        <StorefrontScreen
          feature={feature}
          pharmacyName={
            feature.pharmacyName || data.context.pharmacyId || 'this pharmacy'
          }
          onEmit={data.capabilities?.events?.emit}
        />
      )}
    </Box>
  );
}

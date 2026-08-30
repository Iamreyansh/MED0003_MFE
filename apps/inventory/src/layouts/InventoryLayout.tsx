import { isInventoryScreen } from '@medmate/inventory-contract';
import { Box, StatusMessage } from '@medmate/ui';
import type { InventoryMfeProps } from '../contract';
import { SCREEN_COPY, rootTestId } from '../lib/copy';
import { DetailScreen } from '../ui/detail';
import { ExpiryScreen } from '../ui/expiry';
import { ListScreen } from '../ui/list';
import { RacksScreen } from '../ui/racks';
import { PageHeader } from '../ui/shared/page-header';

export function InventoryLayout({ data }: InventoryMfeProps) {
  const feature = data.feature;
  if (!isInventoryScreen(feature.screen)) {
    return (
      <StatusMessage tone="error">Unknown inventory screen.</StatusMessage>
    );
  }
  const copy = SCREEN_COPY[feature.screen];
  return (
    <Box data-testid={rootTestId(feature.screen)} className="w-full">
      <PageHeader
        title={copy.title}
        helper={copy.helper}
        kicker={copy.kicker}
      />
      {feature.screen === 'list' ? (
        <ListScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : null}
      {feature.screen === 'detail' ? <DetailScreen feature={feature} /> : null}
      {feature.screen === 'expiry' ? (
        <ExpiryScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : null}
      {feature.screen === 'racks' ? <RacksScreen feature={feature} /> : null}
    </Box>
  );
}

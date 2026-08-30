import { isProcurementScreen } from '@medmate/procurement-contract';
import { Box, StatusMessage } from '@medmate/ui';
import type { ProcurementMfeProps } from '../contract';
import { SCREEN_COPY, rootTestId } from '../lib/copy';
import { DistributorsScreen } from '../ui/distributors';
import { EditorScreen } from '../ui/editor';
import { PurchasesScreen } from '../ui/purchases';
import { ReorderScreen } from '../ui/reorder';
import { PageHeader } from '../ui/shared/page-header';

export function ProcurementLayout({ data }: ProcurementMfeProps) {
  const feature = data.feature;
  if (!isProcurementScreen(feature.screen)) {
    return (
      <StatusMessage tone="error">Unknown procurement screen.</StatusMessage>
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
      {feature.screen === 'purchases' ? (
        <PurchasesScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : null}
      {feature.screen === 'editor' ? (
        <EditorScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : null}
      {feature.screen === 'distributors' ? (
        <DistributorsScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : null}
      {feature.screen === 'reorder' ? (
        <ReorderScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : null}
    </Box>
  );
}

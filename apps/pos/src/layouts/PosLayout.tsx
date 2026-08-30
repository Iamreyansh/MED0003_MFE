import { isPosScreen } from '@medmate/pos-contract';
import { Box, StatusMessage } from '@medmate/ui';
import type { PosMfeProps } from '../contract';
import { SCREEN_COPY, rootTestId } from '../lib/copy';
import { CounterScreen } from '../ui/counter';
import { PageHeader } from '../ui/shared/page-header';

export function PosLayout({ data }: PosMfeProps) {
  const feature = data.feature;
  if (!isPosScreen(feature.screen)) {
    return <StatusMessage tone="error">Unknown POS screen.</StatusMessage>;
  }
  const copy = SCREEN_COPY[feature.screen];
  return (
    <Box data-testid={rootTestId(feature.screen)} className="w-full">
      <PageHeader
        title={copy.title}
        helper={copy.helper}
        kicker={copy.kicker}
      />
      <CounterScreen
        feature={feature}
        onNavigate={data.capabilities?.navigate}
      />
    </Box>
  );
}

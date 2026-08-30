import { isFinanceScreen } from '@medmate/finance-contract';
import { Box, StatusMessage } from '@medmate/ui';
import type { FinanceMfeProps } from '../contract';
import { SCREEN_COPY, rootTestId } from '../lib/copy';
import { SettlementDetailScreen } from '../ui/settlement-detail';
import { SettlementsScreen } from '../ui/settlements';
import { PageHeader } from '../ui/shared/page-header';

export function FinanceLayout({ data }: FinanceMfeProps) {
  const feature = data.feature;
  if (!isFinanceScreen(feature.screen)) {
    return <StatusMessage tone="error">Unknown finance screen.</StatusMessage>;
  }
  const copy = SCREEN_COPY[feature.screen];
  return (
    <Box data-testid={rootTestId(feature.screen)} className="w-full">
      <PageHeader
        title={copy.title}
        helper={copy.helper}
        kicker={copy.kicker}
      />
      {feature.screen === 'settlements' ? (
        <SettlementsScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : null}
      {feature.screen === 'settlement-detail' ? (
        <SettlementDetailScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : null}
    </Box>
  );
}

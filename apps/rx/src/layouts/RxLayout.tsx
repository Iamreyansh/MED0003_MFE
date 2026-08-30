import { isRxScreen } from '@medmate/rx-contract';
import { Box, StatusMessage } from '@medmate/ui';
import type { RxMfeProps } from '../contract';
import { SCREEN_COPY, rootTestId } from '../lib/copy';
import { DetailScreen } from '../ui/detail';
import { DrugRegisterScreen } from '../ui/drug-register';
import { QueueScreen } from '../ui/queue';
import { PageHeader } from '../ui/shared/page-header';

export function RxLayout({ data }: RxMfeProps) {
  const feature = data.feature;
  if (!isRxScreen(feature.screen)) {
    return (
      <StatusMessage tone="error">Unknown prescriptions screen.</StatusMessage>
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
      {feature.screen === 'queue' ? (
        <QueueScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : null}
      {feature.screen === 'detail' ? (
        <DetailScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : null}
      {feature.screen === 'drug-register' ? (
        <DrugRegisterScreen feature={feature} />
      ) : null}
    </Box>
  );
}

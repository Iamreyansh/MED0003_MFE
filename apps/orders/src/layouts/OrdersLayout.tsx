import { isOrdersScreen } from '@medmate/orders-contract';
import { Box, StatusMessage } from '@medmate/ui';
import type { OrdersMfeProps } from '../contract';
import { SCREEN_COPY, rootTestId } from '../lib/copy';
import { OrderActionsScreen } from '../ui/order-actions';
import { OrdersHomeScreen } from '../ui/orders-home';
import { RxQuotesScreen } from '../ui/rx-quotes';
import { PageHeader } from '../ui/shared/page-header';

export function OrdersLayout({ data }: OrdersMfeProps) {
  const feature = data.feature;
  if (!isOrdersScreen(feature.screen)) {
    return <StatusMessage tone="error">Unknown orders screen.</StatusMessage>;
  }
  const copy = SCREEN_COPY[feature.screen];
  return (
    <Box data-testid={rootTestId(feature.screen)} className="w-full">
      <PageHeader
        title={copy.title}
        helper={copy.helper}
        kicker={copy.kicker}
      />
      {feature.screen === 'rx-quotes' ? (
        <RxQuotesScreen feature={feature} />
      ) : null}
      {feature.screen === 'orders-home' ? <OrdersHomeScreen /> : null}
      {feature.screen === 'order-actions' ? (
        <OrderActionsScreen feature={feature} />
      ) : null}
    </Box>
  );
}

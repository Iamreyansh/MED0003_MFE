import { isBillingScreen } from '@medmate/billing-contract';
import { Box, StatusMessage } from '@medmate/ui';
import type { BillingMfeProps } from '../contract';
import { SCREEN_COPY, rootTestId } from '../lib/copy';
import { InvoiceDetailScreen } from '../ui/invoice-detail';
import { InvoiceSettingsScreen } from '../ui/invoice-settings';
import { InvoicesScreen } from '../ui/invoices';
import { KhataScreen } from '../ui/khata';
import { KhataDetailScreen } from '../ui/khata-detail';
import { OffersScreen } from '../ui/offers';
import { SalesScreen } from '../ui/sales';
import { PageHeader } from '../ui/shared/page-header';

export function BillingLayout({ data }: BillingMfeProps) {
  const feature = data.feature;
  if (!isBillingScreen(feature.screen)) {
    return <StatusMessage tone="error">Unknown billing screen.</StatusMessage>;
  }
  const copy = SCREEN_COPY[feature.screen];
  return (
    <Box data-testid={rootTestId(feature.screen)} className="w-full">
      <PageHeader title={copy.title} helper={copy.helper} />
      {feature.screen === 'invoices' ? (
        <InvoicesScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : null}
      {feature.screen === 'invoice-detail' ? (
        <InvoiceDetailScreen feature={feature} />
      ) : null}
      {feature.screen === 'invoice-settings' ? (
        <InvoiceSettingsScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : null}
      {feature.screen === 'sales' ? <SalesScreen feature={feature} /> : null}
      {feature.screen === 'khata' ? (
        <KhataScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : null}
      {feature.screen === 'khata-detail' ? (
        <KhataDetailScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : null}
      {feature.screen === 'offers' ? (
        <OffersScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : null}
    </Box>
  );
}

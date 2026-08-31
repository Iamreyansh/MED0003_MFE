import { isSupportScreen } from '@medmate/support-contract';
import { Box, StatusMessage } from '@medmate/ui';
import type { SupportMfeProps } from '../contract';
import { SCREEN_COPY, rootTestId } from '../lib/copy';
import { HelpScreen } from '../ui/help';
import { HelpArticleScreen } from '../ui/help-article';
import { PageHeader } from '../ui/shared/page-header';
import { TicketDetailScreen } from '../ui/ticket-detail';
import { TicketListScreen } from '../ui/ticket-list';
import { TicketNewScreen } from '../ui/ticket-new';

export function SupportLayout({ data }: SupportMfeProps) {
  const feature = data.feature;
  if (!isSupportScreen(feature.screen)) {
    return <StatusMessage tone="error">Unknown support screen.</StatusMessage>;
  }
  const copy = SCREEN_COPY[feature.screen];
  return (
    <Box data-testid={rootTestId(feature.screen)} className="w-full">
      <PageHeader
        title={copy.title}
        helper={copy.helper}
        kicker={copy.kicker}
      />
      {feature.screen === 'ticket-list' ? (
        <TicketListScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : null}
      {feature.screen === 'ticket-new' ? (
        <TicketNewScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : null}
      {feature.screen === 'ticket-detail' ? (
        <TicketDetailScreen feature={feature} />
      ) : null}
      {feature.screen === 'help' ? (
        <HelpScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : null}
      {feature.screen === 'help-article' ? (
        <HelpArticleScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : null}
    </Box>
  );
}

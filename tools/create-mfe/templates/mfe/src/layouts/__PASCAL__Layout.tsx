import { PageSection, Stack, StatusMessage } from '@medmate/ui';
import type { __PASCAL__MfeProps } from '../contract';
import { __NAME__Service } from '../features/__NAME__/api/mfeService';
import { DEFAULT_TITLE } from '../features/__NAME__/model/mfeConstants';
import { FeatureIntro } from '../ui/FeatureIntro';

export function __PASCAL__Layout({ data }: __PASCAL__MfeProps) {
  const title = data.feature.title ?? DEFAULT_TITLE;

  return (
    <PageSection title={title} data-testid="__NAME__-mfe">
      <Stack>
        <StatusMessage>
          Host: {data.context.hostId} · Locale: {data.context.locale}
        </StatusMessage>
        <FeatureIntro status={__NAME__Service.ping()} />
      </Stack>
    </PageSection>
  );
}

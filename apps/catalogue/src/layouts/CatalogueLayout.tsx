import { isCatalogueScreen } from '@medmate/catalogue-contract';
import { Box, StatusMessage } from '@medmate/ui';
import type { CatalogueMfeProps } from '../contract';
import { SCREEN_COPY, rootTestId } from '../lib/copy';
import { MappingScreen } from '../ui/mapping';
import { SearchScreen } from '../ui/search';
import { PageHeader } from '../ui/shared/page-header';

export function CatalogueLayout({ data }: CatalogueMfeProps) {
  const feature = data.feature;
  if (!isCatalogueScreen(feature.screen)) {
    return (
      <StatusMessage tone="error">Unknown catalogue screen.</StatusMessage>
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
      {feature.screen === 'search' ? (
        <SearchScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      ) : (
        <MappingScreen
          feature={feature}
          onNavigate={data.capabilities?.navigate}
        />
      )}
    </Box>
  );
}

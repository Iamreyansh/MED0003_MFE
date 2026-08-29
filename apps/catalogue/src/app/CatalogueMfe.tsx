import { isCatalogueFeatureData } from '@medmate/catalogue-contract';
import { assertMfeDataEnvelope } from '@medmate/contracts';
import { StatusMessage } from '@medmate/ui';
import type { CatalogueMfeProps } from '../contract';
import { CatalogueLayout } from '../layouts/CatalogueLayout';

export default function CatalogueMfe({ data }: CatalogueMfeProps) {
  assertMfeDataEnvelope(data);
  if (!isCatalogueFeatureData(data.feature)) {
    return (
      <StatusMessage tone="error" data-testid="catalogue-contract-error">
        Catalogue module is missing a screen.
      </StatusMessage>
    );
  }
  return <CatalogueLayout data={data} />;
}

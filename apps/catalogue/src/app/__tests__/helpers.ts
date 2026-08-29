import type {
  CatalogueFeatureData,
  CatalogueScreen,
  CatalogueSubmitResult,
} from '@medmate/catalogue-contract';
import type { MfeDataEnvelope } from '@medmate/contracts';
import { createMfeEnvelope } from '@medmate/test-utils';

export function feature(
  screen: CatalogueScreen,
  onSubmit: CatalogueFeatureData['onSubmit'] = async () => ({ ok: true }),
  extra: Partial<CatalogueFeatureData> = {},
): CatalogueFeatureData {
  return {
    screen,
    onSubmit,
    canCreate: true,
    canDelete: true,
    canPatch: true,
    role: 'pharmacy_owner',
    ...extra,
  };
}

export function data(
  next: CatalogueFeatureData,
  extra: Partial<MfeDataEnvelope<CatalogueFeatureData>> = {},
) {
  return {
    ...createMfeEnvelope({
      feature: next,
      context: { hostId: 'test-host', locale: 'en-IN', permissions: [] },
    }),
    ...extra,
  };
}

export const SEARCH_HIT: CatalogueSubmitResult = {
  ok: true,
  results: [
    {
      medicine_id: 'med-1',
      name: 'Crocin 500mg Tablet',
      salt_composition: 'Paracetamol (500mg)',
      manufacturer: 'GSK India',
      schedule: 'H',
      is_mapped: false,
      master_mrp: 22.5,
    },
    {
      medicine_id: 'med-2',
      name: 'Augmentin 625 Tablet',
      schedule: 'H',
      is_mapped: true,
      mapping_id: 'map-1',
      master_mrp: 218.5,
    },
  ],
  meta: { page: 1, limit: 20, total: 2, has_next: true },
};

export const MAPPING_ROWS: CatalogueSubmitResult = {
  ok: true,
  mappings: [
    {
      mapping_id: 'map-1',
      master_medicine_id: 'med-2',
      name: 'Augmentin 625 Tablet',
      schedule: 'H',
      pharmacy_price: 215,
      stock_quantity: 48,
      is_visible: true,
    },
  ],
  meta: { page: 1, limit: 20, total: 1, has_next: false },
};

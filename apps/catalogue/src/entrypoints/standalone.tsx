/**
 * Standalone harness — shared mfe-kit bootstrap only.
 */
import {
  CATALOGUE_SCREENS,
  isCatalogueScreen,
  type CatalogueCommand,
  type CatalogueFeatureData,
  type CatalogueMappingRow,
  type CatalogueScreen,
  type CatalogueSearchResult,
  type CatalogueSubmitResult,
} from '@medmate/catalogue-contract';
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { mountStandalone, StandaloneShell } from '@medmate/mfe-kit';
import { Button, Inline, StatusMessage } from '@medmate/ui';
import { useMemo, useState } from 'react';
import CatalogueMfe from '../app/CatalogueMfe';
import type { CatalogueMfeProps } from '../contract';
import '@medmate/ui/styles.css';

const RESULTS: CatalogueSearchResult[] = [
  {
    medicine_id: 'med-para',
    name: 'Crocin 500mg Tablet',
    salt_composition: 'Paracetamol (500mg)',
    manufacturer: 'GSK India',
    schedule: 'H',
    is_mapped: false,
    master_mrp: 22.5,
  },
  {
    medicine_id: 'med-aug',
    name: 'Augmentin 625 Tablet',
    schedule: 'H',
    is_mapped: true,
    mapping_id: 'map-aug',
    master_mrp: 218.5,
    pharmacy_price: 215,
  },
];

const INITIAL_MAPPINGS: CatalogueMappingRow[] = [
  {
    mapping_id: 'map-aug',
    master_medicine_id: 'med-aug',
    name: 'Augmentin 625 Tablet',
    schedule: 'H',
    pharmacy_price: 215,
    stock_quantity: 48,
    is_visible: true,
  },
];

function readScreen(): CatalogueScreen {
  if (typeof window === 'undefined') {
    return 'search';
  }
  const params = new URLSearchParams(window.location.search);
  const value = params.get('screen');
  return isCatalogueScreen(value) ? value : 'search';
}

function readCreateId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return new URLSearchParams(window.location.search).get('master_medicine_id');
}

function mockSubmit(
  command: CatalogueCommand,
  mappings: CatalogueMappingRow[],
): CatalogueSubmitResult {
  if (command.screen === 'search' && command.action === 'loadScheduleRules') {
    return {
      ok: true,
      scheduleRules: [{ schedule: 'H', full_name: 'Schedule H' }],
    };
  }
  if (command.screen === 'search' && command.action === 'search') {
    const q = command.values.q.toLowerCase();
    const results = RESULTS.filter((item) =>
      item.name.toLowerCase().includes(q),
    );
    return {
      ok: true,
      results,
      meta: { page: command.values.page ?? 1, has_next: false },
    };
  }
  if (command.screen === 'mapping' && command.action === 'load') {
    return {
      ok: true,
      mappings,
      meta: { page: command.values?.page ?? 1, has_next: false },
    };
  }
  if (command.screen === 'mapping' && command.action === 'create') {
    if (command.values.pharmacy_price > 500) {
      return {
        ok: false,
        code: 'PRICE_ABOVE_MRP',
        formError: 'pharmacy_price exceeds master MRP',
      };
    }
    return { ok: true };
  }
  if (command.screen === 'mapping' && command.action === 'update') {
    return { ok: true };
  }
  if (command.screen === 'mapping' && command.action === 'delete') {
    return { ok: true, deleted: true };
  }
  return { ok: true };
}

function StandaloneHarness() {
  const [screen, setScreen] = useState<CatalogueScreen>(readScreen);
  const [log, setLog] = useState('Ready');
  const [mappings, setMappings] = useState(INITIAL_MAPPINGS);

  const feature = useMemo<CatalogueFeatureData>(
    () => ({
      screen,
      canCreate: true,
      canDelete: true,
      canPatch: true,
      role: 'pharmacy_owner',
      createFromMedicineId: screen === 'mapping' ? readCreateId() : null,
      onSubmit: async (command) => {
        setLog(`${command.screen}:${command.action}`);
        const result = mockSubmit(command, mappings);
        if (
          result.ok &&
          command.action === 'delete' &&
          command.screen === 'mapping'
        ) {
          setMappings((current) =>
            current.filter(
              (row) => row.mapping_id !== command.values.mapping_id,
            ),
          );
        }
        return result;
      },
    }),
    [mappings, screen],
  );

  const data = useMemo<CatalogueMfeProps['data']>(
    () => ({
      contractVersion: MFE_CONTRACT_VERSION,
      context: {
        hostId: 'catalogue-standalone',
        locale: 'en-IN',
        permissions: [],
      },
      feature,
      capabilities: {
        navigate: (path) => setLog(`navigate:${path}`),
        api: {
          request: async <T = unknown,>() => ({
            ok: true,
            status: 200,
            data: {} as T,
          }),
        },
      },
    }),
    [feature],
  );

  return (
    <StandaloneShell
      title="Catalogue standalone harness"
      description="Preview search and mapping. Hosts pass screen and onSubmit via data.feature."
      className="max-w-5xl"
    >
      <Inline wrap className="mb-4">
        {CATALOGUE_SCREENS.map((type) => (
          <Button
            key={type}
            type="button"
            variant={type === screen ? 'primary' : 'ghost'}
            onClick={() => setScreen(type)}
          >
            {type}
          </Button>
        ))}
      </Inline>
      <CatalogueMfe data={data} />
      <StatusMessage>{log}</StatusMessage>
    </StandaloneShell>
  );
}

mountStandalone(<StandaloneHarness />);

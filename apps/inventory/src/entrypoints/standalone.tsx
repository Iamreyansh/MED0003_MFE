/**
 * Standalone harness — shared mfe-kit bootstrap only.
 */
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import {
  INVENTORY_SCREENS,
  isInventoryScreen,
  type InventoryCommand,
  type InventoryFeatureData,
  type InventoryScreen,
  type InventorySubmitResult,
  type PlanCode,
  type RackLocation,
} from '@medmate/inventory-contract';
import { mountStandalone, StandaloneShell } from '@medmate/mfe-kit';
import { Button, Inline, StatusMessage } from '@medmate/ui';
import { useMemo, useState } from 'react';
import InventoryMfe from '../app/InventoryMfe';
import type { InventoryMfeProps } from '../contract';
import '@medmate/ui/styles.css';

const INITIAL_RACKS: RackLocation[] = [
  {
    rack_code: 'A1',
    name: 'Counter left',
    description: 'Counter left',
    zone_name: 'OTC',
    product_count: 3,
    medicine_count: 3,
  },
];

function readScreen(): InventoryScreen {
  if (typeof window === 'undefined') {
    return 'list';
  }
  const value = new URLSearchParams(window.location.search).get('screen');
  return isInventoryScreen(value) ? value : 'list';
}

function mockSubmit(
  command: InventoryCommand,
  racks: RackLocation[],
): InventorySubmitResult {
  if (command.screen === 'list' && command.action === 'loadSummary') {
    return {
      ok: true,
      summary: {
        total_products: 1,
        total_quantity: 20,
        low_stock: 0,
        near_expiry: 1,
      },
    };
  }
  if (command.screen === 'list' && command.action === 'load') {
    return {
      ok: true,
      products: [
        {
          product_id: 'prod-1',
          name: 'Crocin 500mg Tablet',
          stock_quantity: 20,
          rack_location_code: 'A1',
          is_online_visible: false,
        },
      ],
      meta: { page: 1, has_next: false },
    };
  }
  if (command.screen === 'detail' && command.action === 'load') {
    if (command.values.product_id === 'missing') {
      return { ok: false, code: 'PRODUCT_NOT_FOUND' };
    }
    return {
      ok: true,
      product: {
        product_id: 'prod-1',
        name: 'Crocin 500mg Tablet',
        stock_quantity: 20,
        rack_location_code: 'A1',
        is_online_visible: false,
      },
    };
  }
  if (command.screen === 'detail' && command.action === 'loadBatches') {
    return {
      ok: true,
      batches: [
        {
          batch_id: 'batch-1',
          batch_number: 'B1',
          expiry_date: '2026-12-01',
          quantity: 20,
        },
      ],
    };
  }
  if (command.screen === 'expiry' && command.action === 'loadAlerts') {
    return {
      ok: true,
      alerts: [
        {
          product_id: 'prod-1',
          name: 'Crocin 500mg Tablet',
          expiry_date: '2026-09-15',
          quantity: 4,
        },
      ],
    };
  }
  if (command.screen === 'expiry' && command.action === 'loadReport') {
    return {
      ok: true,
      report: [
        {
          product_id: 'prod-1',
          name: 'Crocin 500mg Tablet',
          expiry_date: '2026-09-15',
          quantity: 4,
        },
      ],
    };
  }
  if (command.screen === 'racks' && command.action === 'load') {
    return { ok: true, racks };
  }
  if (command.screen === 'racks' && command.action === 'loadUnlocated') {
    return {
      ok: true,
      unlocated: [{ product_id: 'prod-2', name: 'Augmentin 625 Tablet' }],
    };
  }
  return { ok: true };
}

function StandaloneHarness() {
  const [screen, setScreen] = useState<InventoryScreen>(readScreen);
  const [plan, setPlan] = useState<PlanCode>('RETAIL_PRO');
  const [log, setLog] = useState('Ready');
  const [racks, setRacks] = useState(INITIAL_RACKS);

  const feature = useMemo<InventoryFeatureData>(
    () => ({
      screen,
      role: 'pharmacy_owner',
      plan,
      canWrite: true,
      canPatchDetails: true,
      canWriteOff: true,
      canManageRacks: true,
      canToggleOnline: plan !== 'FREE',
      storefrontOnline: true,
      productId: screen === 'detail' ? 'prod-1' : null,
      onSubmit: async (command) => {
        setLog((current) => `${current} ${command.screen}:${command.action}`);
        const result = mockSubmit(command, racks);
        if (
          result.ok &&
          command.screen === 'racks' &&
          command.action === 'delete'
        ) {
          setRacks((current) =>
            current.filter((row) => row.rack_code !== command.values.rack_code),
          );
        }
        return result;
      },
    }),
    [plan, racks, screen],
  );

  const data = useMemo<InventoryMfeProps['data']>(
    () => ({
      contractVersion: MFE_CONTRACT_VERSION,
      context: {
        hostId: 'inventory-standalone',
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
      title="Inventory standalone harness"
      description="Preview list, detail, expiry, and racks. Hosts pass screen and onSubmit via data.feature."
      className="max-w-5xl"
    >
      <Inline wrap className="mb-4">
        {INVENTORY_SCREENS.map((type) => (
          <Button
            key={type}
            type="button"
            variant={type === screen ? 'primary' : 'ghost'}
            onClick={() => setScreen(type)}
          >
            {type}
          </Button>
        ))}
        <Button
          type="button"
          variant={plan === 'FREE' ? 'primary' : 'ghost'}
          onClick={() => setPlan('FREE')}
        >
          Use Free plan
        </Button>
      </Inline>
      <InventoryMfe data={data} />
      <StatusMessage>{log}</StatusMessage>
    </StandaloneShell>
  );
}

mountStandalone(<StandaloneHarness />);

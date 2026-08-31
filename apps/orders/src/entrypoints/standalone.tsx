/**
 * Standalone harness — shared mfe-kit bootstrap only.
 */
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { mountStandalone, StandaloneShell } from '@medmate/mfe-kit';
import {
  ORDERS_SCREENS,
  isOrdersScreen,
  type OrdersCommand,
  type OrdersFeatureData,
  type OrdersScreen,
  type OrdersSubmitResult,
} from '@medmate/orders-contract';
import { Button, Inline, StatusMessage } from '@medmate/ui';
import { useMemo, useState } from 'react';
import OrdersMfe from '../app/OrdersMfe';
import type { OrdersMfeProps } from '../contract';
import '@medmate/ui/styles.css';

const ORDER_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function readScreen(): OrdersScreen {
  if (typeof window === 'undefined') {
    return 'rx-quotes';
  }
  const value = new URLSearchParams(window.location.search).get('screen');
  return isOrdersScreen(value) ? value : 'rx-quotes';
}

function mockSubmit(command: OrdersCommand): OrdersSubmitResult {
  if (command.screen === 'rx-quotes' && command.action === 'load') {
    return {
      ok: true,
      quotes: [
        {
          quote_id: 'q-1',
          status: 'NOTIFIED',
          created_at: '2026-08-30',
        },
        {
          quote_id: 'q-expired',
          status: 'EXPIRED',
          created_at: '2026-08-29',
        },
      ],
      meta: { page: 1, has_next: false },
    };
  }
  if (command.screen === 'orders-home' && command.action === 'load') {
    return { ok: true, orders: [], meta: { page: 1, has_next: false } };
  }
  if (
    command.screen === 'order-actions' &&
    command.action === 'advanceStatus'
  ) {
    if (command.values.status === 'CONFIRMED') {
      return { ok: false, code: 'INVALID_STATUS_TRANSITION' };
    }
  }
  return { ok: true };
}

function StandaloneHarness() {
  const [screen, setScreen] = useState<OrdersScreen>(readScreen);
  const [log, setLog] = useState('Ready');

  const feature = useMemo<OrdersFeatureData>(
    () => ({
      screen,
      role: 'pharmacy_owner',
      plan: 'FREE',
      canMutateOrders: true,
      orderId: screen === 'order-actions' ? ORDER_ID : null,
      tokenScope: 'full',
      onSubmit: async (command) => {
        setLog((current) => `${current} ${command.screen}:${command.action}`);
        return mockSubmit(command);
      },
    }),
    [screen],
  );

  const data = useMemo<OrdersMfeProps['data']>(
    () => ({
      contractVersion: MFE_CONTRACT_VERSION,
      context: {
        hostId: 'orders-standalone',
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
      title="Orders standalone harness"
      description="Preview Rx quotes, order guidance, and id-in-hand actions."
      className="max-w-5xl"
    >
      <Inline wrap className="mb-4">
        {ORDERS_SCREENS.map((type) => (
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
      <OrdersMfe data={data} />
      <StatusMessage>{log}</StatusMessage>
    </StandaloneShell>
  );
}

mountStandalone(<StandaloneHarness />);

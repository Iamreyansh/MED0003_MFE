/**
 * Standalone harness — shared mfe-kit bootstrap only.
 */
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { mountStandalone, StandaloneShell } from '@medmate/mfe-kit';
import {
  RX_SCREENS,
  isRxScreen,
  type RxCommand,
  type RxFeatureData,
  type RxScreen,
  type RxSubmitResult,
} from '@medmate/rx-contract';
import { Button, Inline, StatusMessage } from '@medmate/ui';
import { useMemo, useState } from 'react';
import RxMfe from '../app/RxMfe';
import type { RxMfeProps } from '../contract';
import '@medmate/ui/styles.css';

function readScreen(): RxScreen {
  if (typeof window === 'undefined') {
    return 'queue';
  }
  const value = new URLSearchParams(window.location.search).get('screen');
  return isRxScreen(value) ? value : 'queue';
}

function mockSubmit(command: RxCommand): RxSubmitResult {
  if (command.screen === 'queue' && command.action === 'load') {
    return {
      ok: true,
      prescriptions: [
        {
          rx_id: 'rx-1',
          status: 'PENDING_REVIEW',
          created_at: '2026-08-30',
          schedule_h1: true,
          schedule_x: false,
        },
      ],
      meta: { page: 1, has_next: false },
    };
  }
  if (command.screen === 'detail' && command.action === 'load') {
    if (command.values.rxId === 'missing') {
      return { ok: false, code: 'RX_NOT_FOUND' };
    }
    return {
      ok: true,
      prescription: {
        rx_id: 'rx-1',
        status: 'PENDING_REVIEW',
        created_at: '2026-08-30',
        schedule_h1: true,
        image_url: 'https://core.example/rx.png',
        lines: [
          {
            line_id: 'l1',
            product_name: 'Alprazolam 0.25mg',
            quantity: 10,
            schedule_h1: true,
          },
        ],
      },
    };
  }
  if (command.screen === 'drug-register' && command.action === 'load') {
    return {
      ok: true,
      register: [
        {
          entry_id: 'reg-1',
          dispensed_at: '2026-08-29',
          product_name: 'Alprazolam 0.25mg',
          schedule: 'H1',
          quantity: 10,
          schedule_h1: true,
        },
      ],
      meta: { page: 1 },
    };
  }
  if (
    command.screen === 'drug-register' &&
    command.action === 'loadRetention'
  ) {
    return {
      ok: true,
      retention: { guidance: 'Keep H1/X register rows for two years.' },
    };
  }
  return { ok: true };
}

function StandaloneHarness() {
  const [screen, setScreen] = useState<RxScreen>(readScreen);
  const [log, setLog] = useState('Ready');

  const feature = useMemo<RxFeatureData>(
    () => ({
      screen,
      role: 'pharmacy_owner',
      plan: 'STARTER',
      canMutateRx: true,
      canDispenseToBilling: false,
      canViewRetention: true,
      rxId: screen === 'detail' ? 'rx-1' : null,
      onSubmit: async (command) => {
        setLog((current) => `${current} ${command.screen}:${command.action}`);
        return mockSubmit(command);
      },
    }),
    [screen],
  );

  const data = useMemo<RxMfeProps['data']>(
    () => ({
      contractVersion: MFE_CONTRACT_VERSION,
      context: {
        hostId: 'rx-standalone',
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
      title="Prescriptions standalone harness"
      description="Preview the Rx queue, detail, and drug register."
      className="max-w-5xl"
    >
      <Inline wrap className="mb-4">
        {RX_SCREENS.map((type) => (
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
      <RxMfe data={data} />
      <StatusMessage>{log}</StatusMessage>
    </StandaloneShell>
  );
}

mountStandalone(<StandaloneHarness />);

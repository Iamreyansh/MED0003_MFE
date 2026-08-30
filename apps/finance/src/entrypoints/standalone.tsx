/**
 * Standalone harness — shared mfe-kit bootstrap only.
 */
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import {
  FINANCE_SCREENS,
  isFinanceScreen,
  type FinanceCommand,
  type FinanceFeatureData,
  type FinanceScreen,
  type FinanceSubmitResult,
} from '@medmate/finance-contract';
import { mountStandalone, StandaloneShell } from '@medmate/mfe-kit';
import { Button, Inline, StatusMessage } from '@medmate/ui';
import { useMemo, useState } from 'react';
import FinanceMfe from '../app/FinanceMfe';
import type { FinanceMfeProps } from '../contract';
import '@medmate/ui/styles.css';

const SETTLEMENT_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function readScreen(): FinanceScreen {
  if (typeof window === 'undefined') {
    return 'settlements';
  }
  const value = new URLSearchParams(window.location.search).get('screen');
  return isFinanceScreen(value) ? value : 'settlements';
}

function mockSubmit(command: FinanceCommand): FinanceSubmitResult {
  if (command.screen === 'settlements' && command.action === 'load') {
    return {
      ok: true,
      settlements: [
        {
          settlement_id: SETTLEMENT_ID,
          cycle_from: '2026-08-18',
          cycle_to: '2026-08-24',
          gmv: 125000,
          commission_deducted: 6250,
          net_payable: 118750,
          status: 'RELEASED',
          released_at: '2026-08-25T04:30:00Z',
        },
      ],
      meta: { page: 1, has_next: false },
    };
  }
  if (command.screen === 'settlement-detail' && command.action === 'load') {
    if (command.values.settlementId === 'missing') {
      return { ok: false, code: 'SETTLEMENT_NOT_FOUND' };
    }
    return {
      ok: true,
      settlement: {
        settlement_id: SETTLEMENT_ID,
        cycle_from: '2026-08-18',
        cycle_to: '2026-08-24',
        gmv: 125000,
        commission_pct: 5,
        commission_deducted: 6250,
        tcs_deducted: 125,
        net_payable: 118625,
        status: 'RELEASED',
        released_at: '2026-08-25T04:30:00Z',
        utr: 'AXIS123456',
      },
    };
  }
  return { ok: true };
}

function StandaloneHarness() {
  const [screen, setScreen] = useState<FinanceScreen>(readScreen);
  const [log, setLog] = useState('Ready');

  const feature = useMemo<FinanceFeatureData>(
    () => ({
      screen,
      role: 'pharmacy_owner',
      plan: 'FREE',
      canViewSettlements: true,
      settlementId: screen === 'settlement-detail' ? SETTLEMENT_ID : null,
      tokenScope: 'full',
      onSubmit: async (command) => {
        setLog((current) => `${current} ${command.screen}:${command.action}`);
        return mockSubmit(command);
      },
    }),
    [screen],
  );

  const data = useMemo<FinanceMfeProps['data']>(
    () => ({
      contractVersion: MFE_CONTRACT_VERSION,
      context: {
        hostId: 'finance-standalone',
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
      title="Finance standalone harness"
      description="Preview settlement history and read-only detail."
      className="max-w-5xl"
    >
      <Inline wrap className="mb-4">
        {FINANCE_SCREENS.map((type) => (
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
      <FinanceMfe data={data} />
      <StatusMessage>{log}</StatusMessage>
    </StandaloneShell>
  );
}

mountStandalone(<StandaloneHarness />);

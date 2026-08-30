import type { MfeDataEnvelope } from '@medmate/contracts';
import type {
  FinanceFeatureData,
  FinanceScreen,
  FinanceSubmitResult,
} from '@medmate/finance-contract';
import { createMfeEnvelope } from '@medmate/test-utils';

export const SETTLEMENT_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

export function feature(
  screen: FinanceScreen,
  onSubmit: FinanceFeatureData['onSubmit'] = async () => ({ ok: true }),
  extra: Partial<FinanceFeatureData> = {},
): FinanceFeatureData {
  return {
    screen,
    onSubmit,
    role: 'pharmacy_owner',
    plan: 'FREE',
    canViewSettlements: true,
    settlementId: screen === 'settlement-detail' ? SETTLEMENT_ID : null,
    tokenScope: 'full',
    ...extra,
  };
}

export function data(
  next: FinanceFeatureData,
  extra: Partial<MfeDataEnvelope<FinanceFeatureData>> = {},
) {
  return {
    ...createMfeEnvelope({
      feature: next,
      context: { hostId: 'test-host', locale: 'en-IN', permissions: [] },
    }),
    ...extra,
  };
}

export const SETTLEMENT_LIST: FinanceSubmitResult = {
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
  meta: { page: 1, has_next: true },
};

export const SETTLEMENT_DETAIL: FinanceSubmitResult = {
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

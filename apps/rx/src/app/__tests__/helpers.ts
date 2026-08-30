import type { MfeDataEnvelope } from '@medmate/contracts';
import type {
  RxFeatureData,
  RxScreen,
  RxSubmitResult,
} from '@medmate/rx-contract';
import { createMfeEnvelope } from '@medmate/test-utils';

export function feature(
  screen: RxScreen,
  onSubmit: RxFeatureData['onSubmit'] = async () => ({ ok: true }),
  extra: Partial<RxFeatureData> = {},
): RxFeatureData {
  return {
    screen,
    onSubmit,
    role: 'pharmacy_owner',
    plan: 'STARTER',
    canMutateRx: true,
    canDispenseToBilling: false,
    canViewRetention: true,
    rxId: screen === 'detail' ? 'rx-1' : null,
    ...extra,
  };
}

export function data(
  next: RxFeatureData,
  extra: Partial<MfeDataEnvelope<RxFeatureData>> = {},
) {
  return {
    ...createMfeEnvelope({
      feature: next,
      context: { hostId: 'test-host', locale: 'en-IN', permissions: [] },
    }),
    ...extra,
  };
}

export const RX_LIST: RxSubmitResult = {
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
  meta: { page: 1, has_next: true },
};

export const RX_DETAIL: RxSubmitResult = {
  ok: true,
  prescription: {
    rx_id: 'rx-1',
    status: 'PENDING_REVIEW',
    created_at: '2026-08-30',
    updated_at: '2026-08-30',
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

export const RX_APPROVED: RxSubmitResult = {
  ok: true,
  prescription: {
    rx_id: 'rx-1',
    status: 'APPROVED',
    schedule_x: true,
    lines: [{ product_name: 'Morphine', quantity: 2, schedule_x: true }],
  },
};

export const REGISTER_LIST: RxSubmitResult = {
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
  meta: { page: 1, has_next: false },
};

export const RETENTION: RxSubmitResult = {
  ok: true,
  retention: { guidance: 'Keep H1/X register rows for two years.' },
};

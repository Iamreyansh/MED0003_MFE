import type { MfeDataEnvelope } from '@medmate/contracts';
import type {
  SubscriptionFeatureData,
  SubscriptionScreen,
  SubscriptionSubmitResult,
} from '@medmate/subscription-contract';
import { createMfeEnvelope } from '@medmate/test-utils';

export function feature(
  screen: SubscriptionScreen,
  onSubmit: SubscriptionFeatureData['onSubmit'] = async () => ({ ok: true }),
  extra: Partial<SubscriptionFeatureData> = {},
): SubscriptionFeatureData {
  return {
    screen,
    onSubmit,
    canWrite: true,
    role: 'pharmacy_owner',
    ...extra,
  };
}

export function data(
  next: SubscriptionFeatureData,
  extra: Partial<MfeDataEnvelope<SubscriptionFeatureData>> = {},
) {
  return {
    ...createMfeEnvelope({
      feature: next,
      context: { hostId: 'test-host', locale: 'en-IN', permissions: [] },
    }),
    ...extra,
  };
}

export const FREE_LOAD: SubscriptionSubmitResult = {
  ok: true,
  plans: [
    {
      id: 'plan-free',
      name: 'FREE',
      price_monthly_rs: 0,
      seat_limit: 1,
      included_modules: ['pos'],
    },
    {
      id: 'plan-starter',
      name: 'STARTER',
      price_monthly_rs: 499,
      seat_limit: 3,
      included_modules: ['pos', 'khata'],
    },
    {
      id: 'plan-growth',
      name: 'RETAIL_PRO',
      price_monthly_rs: 1499,
      included_modules: ['analytics'],
    },
    {
      id: 'plan-pro',
      name: 'ENTERPRISE',
      price_monthly_rs: null,
      price_annual_rs: null,
      custom_price: true,
    },
    {
      id: 'plan-blank',
      name: 'CUSTOM',
    },
  ],
  subscription: { current_plan: 'FREE', status: 'ACTIVE', auto_renew: true },
};

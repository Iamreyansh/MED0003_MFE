/**
 * Standalone harness — shared mfe-kit bootstrap only.
 */
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { mountStandalone, StandaloneShell } from '@medmate/mfe-kit';
import {
  SUBSCRIPTION_SCREENS,
  isSubscriptionScreen,
  type CurrentSubscription,
  type PlanCard,
  type SaasInvoice,
  type SubscriptionCommand,
  type SubscriptionFeatureData,
  type SubscriptionScreen,
  type SubscriptionSubmitResult,
} from '@medmate/subscription-contract';
import { Button, Inline, StatusMessage } from '@medmate/ui';
import { useMemo, useState } from 'react';
import SubscriptionMfe from '../app/SubscriptionMfe';
import type { SubscriptionMfeProps } from '../contract';
import '@medmate/ui/styles.css';

const PLANS: PlanCard[] = [
  {
    id: 'plan-free',
    name: 'FREE',
    price_monthly_rs: 0,
    price_annual_rs: 0,
    seat_limit: 1,
    included_modules: ['pos'],
  },
  {
    id: 'plan-starter',
    name: 'STARTER',
    price_monthly_rs: 499,
    price_annual_rs: 4990,
    seat_limit: 3,
    included_modules: ['pos', 'khata'],
  },
  {
    id: 'plan-growth',
    name: 'RETAIL_PRO',
    price_monthly_rs: 1499,
    price_annual_rs: 14990,
    seat_limit: 8,
    included_modules: ['pos', 'khata', 'analytics'],
  },
  {
    id: 'plan-pro',
    name: 'ENTERPRISE',
    price_monthly_rs: null,
    price_annual_rs: null,
    custom_price: true,
    included_modules: ['pos', 'khata', 'analytics'],
  },
];

const SUBSCRIPTION: CurrentSubscription = {
  current_plan: 'FREE',
  status: 'ACTIVE',
  auto_renew: true,
  seat_limit: 1,
};

const INVOICES: SaasInvoice[] = [
  { id: 'inv-unpaid', status: 'unpaid', amount_rs: 499 },
  { id: 'inv-paid', status: 'paid', amount_rs: 499, paid_at: '2026-08-01' },
];

function readScreen(): SubscriptionScreen {
  if (typeof window === 'undefined') {
    return 'plans';
  }
  const value = new URLSearchParams(window.location.search).get('screen');
  return isSubscriptionScreen(value) ? value : 'plans';
}

async function mockSubmit(
  command: SubscriptionCommand,
): Promise<SubscriptionSubmitResult> {
  if (command.screen === 'plans' && command.action === 'load') {
    return { ok: true, plans: PLANS, subscription: SUBSCRIPTION };
  }
  if (command.screen === 'plans' && command.action === 'subscribe') {
    return {
      ok: true,
      subscription: {
        current_plan: 'STARTER',
        status: 'ACTIVE',
        auto_renew: true,
      },
    };
  }
  if (command.screen === 'billing' && command.action === 'load') {
    return { ok: true, invoices: INVOICES };
  }
  if (command.screen === 'billing' && command.action === 'loadInvoice') {
    return {
      ok: true,
      invoice: { id: command.values.id, status: 'unpaid', amount_rs: 499 },
    };
  }
  if (command.screen === 'billing' && command.action === 'pay') {
    return {
      ok: true,
      pay: { payment_link: 'https://payments.example/checkout' },
    };
  }
  return { ok: true };
}

function StandaloneHarness() {
  const [screen, setScreen] = useState<SubscriptionScreen>(readScreen);
  const [log, setLog] = useState('Ready');

  const feature = useMemo<SubscriptionFeatureData>(
    () => ({
      screen,
      canWrite: true,
      role: 'pharmacy_owner',
      onSubmit: async (command) => {
        setLog(`${command.screen}:${command.action}`);
        return mockSubmit(command);
      },
    }),
    [screen],
  );

  const data = useMemo<SubscriptionMfeProps['data']>(
    () => ({
      contractVersion: MFE_CONTRACT_VERSION,
      context: {
        hostId: 'subscription-standalone',
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
          createIdempotencyKey: () => 'standalone-key',
        },
      },
    }),
    [feature],
  );

  return (
    <StandaloneShell
      title="Subscription standalone harness"
      description="Preview plans and SaaS billing. Hosts pass screen and onSubmit via data.feature."
      className="max-w-5xl"
    >
      <Inline wrap className="mb-4">
        {SUBSCRIPTION_SCREENS.map((type) => (
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
      <SubscriptionMfe data={data} />
      <StatusMessage>{log}</StatusMessage>
    </StandaloneShell>
  );
}

mountStandalone(<StandaloneHarness />);

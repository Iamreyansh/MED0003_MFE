/**
 * Standalone harness — shared mfe-kit bootstrap only.
 */
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { mountStandalone, StandaloneShell } from '@medmate/mfe-kit';
import {
  isOnboardingScreen,
  ONBOARDING_SCREENS,
  type OnboardingFeatureData,
  type OnboardingScreen,
  type OnboardingSubmitResult,
} from '@medmate/onboarding-contract';
import { Button, Inline, StatusMessage } from '@medmate/ui';
import { useMemo, useState } from 'react';
import OnboardingMfe from '../app/OnboardingMfe';
import type { OnboardingMfeProps } from '../contract';
import '@medmate/ui/styles.css';

function readScreen(): OnboardingScreen {
  if (typeof window === 'undefined') {
    return 'register';
  }
  const value = new URLSearchParams(window.location.search).get('screen');
  return isOnboardingScreen(value) ? value : 'register';
}

async function mockSubmit(
  screen: OnboardingScreen,
  action: string,
): Promise<OnboardingSubmitResult> {
  if (screen === 'register') {
    return { ok: true, nextStep: 'verify' };
  }
  if (screen === 'verify' && action === 'resendOtp') {
    return { ok: true, retryAfterSeconds: 60, resendsRemaining: 2 };
  }
  if (screen === 'verify') {
    return { ok: true, nextStep: 'status' };
  }
  if (screen === 'status') {
    return {
      ok: true,
      status: {
        pharmacy_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        business_name: 'Sri Rama Medicals',
        status: 'PENDING_KYC',
        plan: 'FREE',
        email_verified: true,
        kyc: { documents_uploaded: 0, documents_required: 5 },
      },
    };
  }
  return {
    ok: true,
    documents: {
      documents: [],
      required_documents: ['GSTIN_CERTIFICATE', 'DRUG_LICENCE', 'PAN_CARD'],
      missing_documents: ['GSTIN_CERTIFICATE', 'DRUG_LICENCE', 'PAN_CARD'],
      ready_to_submit: false,
    },
  };
}

function StandaloneHarness() {
  const [screen, setScreen] = useState<OnboardingScreen>(readScreen);
  const [log, setLog] = useState('Ready');

  const feature = useMemo<OnboardingFeatureData>(
    () => ({
      screen,
      canWriteKyc: true,
      role: 'pharmacy_owner',
      pollIntervalMs: 30_000,
      initialValues: { email: 'priya@srirama.in' },
      links: { login: '/login' },
      onSubmit: async (command) => {
        setLog(`${command.screen}:${command.action}`);
        return mockSubmit(command.screen, command.action);
      },
    }),
    [screen],
  );

  const data = useMemo<OnboardingMfeProps['data']>(
    () => ({
      contractVersion: MFE_CONTRACT_VERSION,
      context: {
        hostId: 'onboarding-standalone',
        locale: 'en-IN',
        permissions: [],
      },
      feature,
      capabilities: {
        navigate: (path) => setLog(`navigate:${path}`),
        telemetry: {
          track: (event) => setLog(event),
        },
      },
    }),
    [feature],
  );

  return (
    <StandaloneShell
      title="Onboarding standalone harness"
      description="Preview register, verify, status, and KYC. Hosts pass screen and onSubmit via data.feature."
      className="max-w-6xl"
    >
      <Inline wrap className="mb-4">
        {ONBOARDING_SCREENS.map((type) => (
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
      <OnboardingMfe data={data} />
      <StatusMessage>{log}</StatusMessage>
    </StandaloneShell>
  );
}

mountStandalone(<StandaloneHarness />);

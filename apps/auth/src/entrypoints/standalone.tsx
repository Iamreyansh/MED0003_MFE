/**
 * Standalone harness — shared mfe-kit bootstrap only.
 * Styles are imported here for local/dev; federated hosts get styles via remote.tsx.
 */
import {
  AUTH_PORTAL_TYPES,
  isAuthPortalType,
  type AuthFeatureData,
  type AuthPortalType,
  type AuthSubmitResult,
} from '@medmate/auth-contract';
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { mountStandalone, StandaloneShell } from '@medmate/mfe-kit';
import { Button, Inline, StatusMessage } from '@medmate/ui';
import { useMemo, useState } from 'react';
import AuthMfe from '../app/AuthMfe';
import type { AuthMfeProps } from '../contract';
import { SESSION_FIXTURES } from '../ui/sessions/mock';
import '@medmate/ui/styles.css';

function readPortalType(): AuthPortalType {
  if (typeof window === 'undefined') {
    return 'pharmacy';
  }
  const value = new URLSearchParams(window.location.search).get('portalType');
  return isAuthPortalType(value) ? value : 'pharmacy';
}

async function mockSubmit(
  portalType: AuthPortalType,
): Promise<AuthSubmitResult> {
  if (portalType === 'customer-otp' || portalType === 'rider-otp') {
    return {
      ok: true,
      nextStep: 'otp',
      context: { sessionId: 'otp-session', attemptsRemaining: 3 },
    };
  }
  if (portalType === 'admin') {
    return { ok: true, nextStep: 'mfa' };
  }
  if (portalType === 'pharmacy-register-otp') {
    return { ok: true, nextStep: 'otp' };
  }
  if (portalType === 'sessions') {
    return {
      ok: true,
      sessions: SESSION_FIXTURES,
      page: 1,
      hasNext: false,
    };
  }
  return { ok: true, nextStep: 'done' };
}

function StandaloneHarness() {
  const [portalType, setPortalType] = useState<AuthPortalType>(readPortalType);
  const [log, setLog] = useState('Ready');

  const feature = useMemo<AuthFeatureData>(
    () => ({
      portalType,
      links: { posLogin: '/pos-login' },
      onSubmit: async (command) => {
        setLog(`${command.portalType}:${command.action}`);
        return mockSubmit(command.portalType);
      },
    }),
    [portalType],
  );

  const data = useMemo<AuthMfeProps['data']>(
    () => ({
      contractVersion: MFE_CONTRACT_VERSION,
      context: {
        hostId: 'auth-standalone',
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
      title="Auth standalone harness"
      description="Preview every Core login system. Hosts pass portalType and onSubmit via data.feature."
    >
      <Inline wrap className="mb-4">
        {AUTH_PORTAL_TYPES.map((type) => (
          <Button
            key={type}
            type="button"
            variant={type === portalType ? 'primary' : 'ghost'}
            onClick={() => setPortalType(type)}
          >
            {type}
          </Button>
        ))}
      </Inline>
      <AuthMfe data={data} />
      <StatusMessage>{log}</StatusMessage>
    </StandaloneShell>
  );
}

mountStandalone(<StandaloneHarness />);

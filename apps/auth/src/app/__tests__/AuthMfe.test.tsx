import type { AuthPortalType } from '@medmate/auth-contract';
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { createMfeEnvelope } from '@medmate/test-utils';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AuthShell } from '../../layouts/AuthShell';
import AuthMfe from '../AuthMfe';
import { data, feature } from './helpers';

afterEach(() => {
  cleanup();
});

describe('AuthMfe', () => {
  it('shows a contract error without portalType', () => {
    render(
      <AuthMfe
        data={createMfeEnvelope({
          feature: { title: 'x' } as never,
        })}
      />,
    );
    expect(screen.getByTestId('auth-contract-error')).toBeTruthy();
  });
});

describe('AuthShell', () => {
  it('renders unknown portal types', () => {
    render(
      <AuthShell
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: {
            portalType: 'nope' as AuthPortalType,
            onSubmit: async () => ({ ok: true }),
          },
        }}
      />,
    );
    expect(screen.getByText('Unknown auth portal type.')).toBeTruthy();
  });

  it('routes pharmacy, pos, and sessions layouts', () => {
    const { rerender } = render(<AuthMfe data={data(feature('pharmacy'))} />);
    expect(screen.getByTestId('login-page')).toBeTruthy();
    rerender(<AuthMfe data={data(feature('pos'))} />);
    expect(screen.getByTestId('pos-login-page')).toBeTruthy();
    rerender(
      <AuthMfe data={data(feature('sessions', undefined, { sessions: [] }))} />,
    );
    expect(screen.getByTestId('sessions-page')).toBeTruthy();
  });
});

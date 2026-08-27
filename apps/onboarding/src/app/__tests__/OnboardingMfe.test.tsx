import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import type { OnboardingScreen } from '@medmate/onboarding-contract';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { OnboardingLayout } from '../../layouts/OnboardingLayout';
import OnboardingMfe from '../OnboardingMfe';
import { data, feature } from './helpers';

afterEach(() => {
  cleanup();
});

describe('OnboardingMfe', () => {
  it('shows a contract error without a screen', () => {
    render(
      <OnboardingMfe
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: { title: 'x' } as never,
        }}
      />,
    );
    expect(screen.getByTestId('onboarding-contract-error')).toBeTruthy();
  });
});

describe('OnboardingLayout', () => {
  it('renders unknown screens', () => {
    render(
      <OnboardingLayout
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: {
            screen: 'nope' as OnboardingScreen,
            onSubmit: async () => ({ ok: true }),
          },
        }}
      />,
    );
    expect(screen.getByText('Unknown onboarding screen.')).toBeTruthy();
  });

  it('routes register and status layouts', async () => {
    const { rerender } = render(
      <OnboardingMfe data={data(feature('register'))} />,
    );
    expect(screen.getByTestId('register-page')).toBeTruthy();
    expect(screen.getAllByLabelText('Onboarding steps').length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText('Account (current)').length).toBeGreaterThan(0);
    expect(screen.getByText('Step 1 of 4')).toBeTruthy();
    rerender(
      <OnboardingMfe
        data={data(
          feature('status', async () => ({
            ok: true,
            status: { status: 'ACTIVE', plan: 'FREE' },
          })),
        )}
      />,
    );
    expect(screen.getByTestId('onboarding-status-page')).toBeTruthy();
    expect(screen.getAllByText('Review (current)').length).toBeGreaterThan(0);
    rerender(
      <OnboardingMfe
        data={data(
          feature('verify', async () => ({ ok: true }), {
            initialValues: { email: 'priya@srirama.in' },
          }),
        )}
      />,
    );
    expect(screen.getByTestId('register-verify-page')).toBeTruthy();
    rerender(
      <OnboardingMfe
        data={data(
          feature('kyc', async () => ({
            ok: true,
            documents: { documents: [] },
          })),
        )}
      />,
    );
    expect(screen.getByTestId('onboarding-kyc-page')).toBeTruthy();
  });
});

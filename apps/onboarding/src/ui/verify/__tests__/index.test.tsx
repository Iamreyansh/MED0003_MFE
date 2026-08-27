import type { OnboardingSubmitResult } from '@medmate/onboarding-contract';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature } from '../../../app/__tests__/helpers';
import OnboardingMfe from '../../../app/OnboardingMfe';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('VerifyScreen', () => {
  it('verifies OTP and resends with cooldown', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (command) => {
      if (command.action === 'resendOtp') {
        return {
          ok: true,
          retryAfterSeconds: 1,
          resendsRemaining: 2,
        } satisfies OnboardingSubmitResult;
      }
      return { ok: true, nextStep: 'status' } satisfies OnboardingSubmitResult;
    });
    render(
      <OnboardingMfe
        data={data(
          feature('verify', onSubmit, {
            initialValues: { email: 'priya@srirama.in' },
          }),
        )}
      />,
    );
    expect(screen.getByRole('group', { name: 'Email OTP' })).toBeTruthy();
    await user.type(screen.getByLabelText('Email OTP digit 1'), '1');
    await user.type(screen.getByLabelText('Email OTP digit 2'), '2');
    await user.type(screen.getByLabelText('Email OTP digit 3'), '3');
    await user.type(screen.getByLabelText('Email OTP digit 4'), '4');
    await user.type(screen.getByLabelText('Email OTP digit 5'), '5');
    await user.type(screen.getByLabelText('Email OTP digit 6'), '6');
    await user.click(screen.getByRole('button', { name: 'Verify email' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    await user.click(screen.getByRole('button', { name: 'Resend OTP' }));
    expect(await screen.findByText(/Resend in/)).toBeTruthy();
  });

  it('surfaces invalid OTP and rate-limited resend', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (command) => {
      if (command.action === 'resendOtp') {
        return {
          ok: false,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfterSeconds: 1,
          formError: 'Wait 1s before resending.',
        } satisfies OnboardingSubmitResult;
      }
      return {
        ok: false,
        code: 'INVALID_OTP',
        formError: 'OTP is not valid.',
        fieldErrors: { otp: 'OTP is not valid.' },
      } satisfies OnboardingSubmitResult;
    });
    render(
      <OnboardingMfe
        data={data(
          feature('verify', onSubmit, {
            initialValues: { email: 'priya@srirama.in' },
            formError: 'Host verify error',
          }),
        )}
      />,
    );
    await user.type(screen.getByLabelText('Email OTP digit 1'), '1');
    await user.type(screen.getByLabelText('Email OTP digit 2'), '2');
    await user.type(screen.getByLabelText('Email OTP digit 3'), '3');
    await user.type(screen.getByLabelText('Email OTP digit 4'), '4');
    await user.type(screen.getByLabelText('Email OTP digit 5'), '5');
    await user.type(screen.getByLabelText('Email OTP digit 6'), '6');
    await user.click(screen.getByRole('button', { name: 'Verify email' }));
    expect(await screen.findByTestId('verify-error')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Resend OTP' }));
    expect(await screen.findByText(/Wait 1s/)).toBeTruthy();
  });

  it('blocks resend without email', () => {
    render(<OnboardingMfe data={data(feature('verify'))} />);
    expect(screen.getByRole('button', { name: 'Resend OTP' })).toBeDisabled();
  });

  it('surfaces a generic resend failure', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (command) => {
      if (command.action === 'resendOtp') {
        return { ok: false } satisfies OnboardingSubmitResult;
      }
      return { ok: true } satisfies OnboardingSubmitResult;
    });
    render(
      <OnboardingMfe
        data={data(
          feature('verify', onSubmit, {
            initialValues: { email: 'priya@srirama.in' },
          }),
        )}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Resend OTP' }));
    expect(await screen.findByText('Unable to resend OTP.')).toBeTruthy();
  });

  it('defaults resend cooldown when Core omits retry-after', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async () => ({ ok: true }) satisfies OnboardingSubmitResult,
    );
    render(
      <OnboardingMfe
        data={data(
          feature('verify', onSubmit, {
            initialValues: { email: 'priya@srirama.in' },
          }),
        )}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Resend OTP' }));
    expect(await screen.findByText(/Resend in/)).toBeTruthy();
  });

  it('uses retry-after copy when resend is rate limited', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async () =>
        ({
          ok: false,
          retryAfterSeconds: 1,
        }) satisfies OnboardingSubmitResult,
    );
    render(
      <OnboardingMfe
        data={data(
          feature('verify', onSubmit, {
            initialValues: { email: 'priya@srirama.in' },
          }),
        )}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Resend OTP' }));
    expect(await screen.findByText('Wait 1s before resending.')).toBeTruthy();
  });
});

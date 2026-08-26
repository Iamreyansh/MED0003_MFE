import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature } from '../../../app/__tests__/helpers';
import AuthMfe from '../../../app/AuthMfe';

afterEach(() => {
  cleanup();
});

describe('OtpLoginScreen', () => {
  it('walks customer OTP send, verify, and resend', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (command) => {
      if (command.action === 'sendOtp' || command.action === 'resendOtp') {
        return {
          ok: true,
          nextStep: 'otp' as const,
          context: { sessionId: 'sid', attemptsRemaining: 2 },
        };
      }
      return { ok: true };
    });
    render(<AuthMfe data={data(feature('customer-otp', onSubmit))} />);
    await user.type(screen.getByLabelText('Mobile number'), '+919876543210');
    await user.click(screen.getByRole('button', { name: 'Send OTP' }));
    expect(
      await screen.findByRole('button', { name: 'Verify OTP' }),
    ).toBeTruthy();
    await user.type(screen.getByLabelText('OTP digit 1'), '1');
    await user.click(screen.getByRole('button', { name: 'Resend OTP' }));
    await user.click(screen.getByRole('button', { name: 'Verify OTP' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('supports rider OTP starting on the OTP step', () => {
    const onSubmit = vi.fn(async () => ({ ok: true }));
    render(
      <AuthMfe
        data={data(
          feature('rider-otp', onSubmit, {
            initialStep: 'otp',
            initialValues: { phone: '+919876543210' },
            otpContext: { sessionId: 'sid' },
          }),
        )}
      />,
    );
    expect(screen.getByRole('button', { name: 'Verify OTP' })).toBeTruthy();
  });

  it('covers send failure, resend wait, invalid OTP, and verify paths', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (command) => {
      if (command.action === 'sendOtp') {
        return { ok: false, formError: 'OTP_RATE_LIMITED' };
      }
      if (command.action === 'resendOtp') {
        return { ok: false, formError: 'wait' };
      }
      return { ok: true };
    });
    render(<AuthMfe data={data(feature('customer-otp', onSubmit))} />);
    await user.type(screen.getByLabelText('Mobile number'), '+919876543210');
    await user.click(screen.getByRole('button', { name: 'Send OTP' }));
    expect(await screen.findByText('OTP_RATE_LIMITED')).toBeTruthy();
    cleanup();

    render(
      <AuthMfe
        data={data(
          feature('rider-otp', onSubmit, {
            initialStep: 'otp',
            initialValues: { phone: '+919876543210' },
            otpContext: { sessionId: 'sid', resendAllowedAt: 'not-a-date' },
          }),
        )}
      />,
    );
    expect(screen.getByRole('button', { name: 'Resend OTP' })).toBeTruthy();
    await user.type(screen.getByLabelText('OTP digit 1'), '1');
    await user.type(screen.getByLabelText('OTP digit 2'), '2');
    await user.type(screen.getByLabelText('OTP digit 3'), '3');
    await user.type(screen.getByLabelText('OTP digit 4'), '4');
    await user.type(screen.getByLabelText('OTP digit 5'), '5');
    await user.type(screen.getByLabelText('OTP digit 6'), '6');
    await user.click(screen.getByRole('button', { name: 'Verify OTP' }));
    cleanup();

    const otpResend = vi.fn(async (command) => {
      if (command.action === 'resendOtp') {
        return { ok: true };
      }
      return { ok: true };
    });
    render(
      <AuthMfe
        data={data(
          feature('customer-otp', otpResend, {
            initialStep: 'otp',
            initialValues: { phone: '+919876543210' },
            otpContext: { sessionId: 'sid' },
            errors: { otp: 'Wrong OTP' },
          }),
        )}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Verify OTP' }));
    expect(await screen.findByText('Enter the 6-digit OTP.')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Resend OTP' }));
    await waitFor(() =>
      expect(
        otpResend.mock.calls.some((call) => call[0].action === 'resendOtp'),
      ).toBe(true),
    );
    cleanup();

    const future = new Date(Date.now() + 30_000).toISOString();
    render(
      <AuthMfe
        data={data(
          feature('rider-otp', async () => ({ ok: true }), {
            initialStep: 'otp',
            initialValues: { phone: '+919876543210' },
            otpContext: { sessionId: 'sid', resendAllowedAt: future },
          }),
        )}
      />,
    );
    expect(screen.getByRole('button', { name: /Resend in/ })).toBeDisabled();
    cleanup();

    const sendOtpBare = vi.fn(async () => ({ ok: true }));
    render(<AuthMfe data={data(feature('customer-otp', sendOtpBare))} />);
    await user.type(screen.getByLabelText('Mobile number'), '+919876543210');
    await user.click(screen.getByRole('button', { name: 'Send OTP' }));
    expect(
      await screen.findByRole('button', { name: 'Verify OTP' }),
    ).toBeTruthy();
    cleanup();

    render(
      <AuthMfe
        data={data(
          feature('rider-otp', async () => ({ ok: true }), {
            initialStep: 'otp',
            initialValues: { phone: '+919876543210' },
          }),
        )}
      />,
    );
    await user.type(screen.getByLabelText('OTP digit 1'), '1');
    await user.type(screen.getByLabelText('OTP digit 2'), '2');
    await user.type(screen.getByLabelText('OTP digit 3'), '3');
    await user.type(screen.getByLabelText('OTP digit 4'), '4');
    await user.type(screen.getByLabelText('OTP digit 5'), '5');
    await user.type(screen.getByLabelText('OTP digit 6'), '6');
    await user.click(screen.getByRole('button', { name: 'Verify OTP' }));
  });
});

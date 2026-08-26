import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature } from '../../../app/__tests__/helpers';
import AuthMfe from '../../../app/AuthMfe';

afterEach(() => {
  cleanup();
});

describe('RegisterOtpScreen', () => {
  it('verifies pharmacy registration email OTP', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (command) => {
      if (command.action === 'sendOtp' || command.action === 'resendOtp') {
        return { ok: true, nextStep: 'otp' as const };
      }
      return { ok: true };
    });
    render(<AuthMfe data={data(feature('pharmacy-register-otp', onSubmit))} />);
    await user.type(screen.getByLabelText('Email'), 'owner@srirama.in');
    await user.click(screen.getByRole('button', { name: 'Send OTP' }));
    expect(
      await screen.findByRole('button', { name: 'Verify email' }),
    ).toBeTruthy();
    await user.type(screen.getByLabelText('Email OTP digit 1'), '1');
    await user.click(screen.getByRole('button', { name: 'Resend OTP' }));
    await user.click(screen.getByRole('button', { name: 'Verify email' }));
  });

  it('starts on the OTP step and surfaces send errors', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (command) => {
      if (command.action === 'sendOtp') {
        return { ok: false, formError: 'Email in use' };
      }
      return { ok: true };
    });
    render(
      <AuthMfe
        data={data(
          feature('pharmacy-register-otp', onSubmit, {
            initialStep: 'otp',
            initialValues: { email: 'a@b.c' },
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
    await user.click(screen.getByRole('button', { name: 'Resend OTP' }));
    cleanup();

    render(
      <AuthMfe
        data={data(
          feature('pharmacy-register-otp', onSubmit, {
            formError: 'Host register error',
          }),
        )}
      />,
    );
    await user.type(screen.getByLabelText('Email'), 'owner@srirama.in');
    await user.click(screen.getByRole('button', { name: 'Send OTP' }));
    expect(await screen.findByText('Email in use')).toBeTruthy();
  });
});

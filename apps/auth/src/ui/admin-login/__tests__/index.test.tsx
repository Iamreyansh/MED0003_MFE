import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature } from '../../../app/__tests__/helpers';
import AuthMfe from '../../../app/AuthMfe';

afterEach(() => {
  cleanup();
});

describe('AdminLoginScreen', () => {
  it('moves admin login to MFA then verifies', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (command) => {
      if (command.action === 'login') {
        return { ok: true, nextStep: 'mfa' as const };
      }
      return { ok: true };
    });
    render(<AuthMfe data={data(feature('admin', onSubmit))} />);
    await user.type(screen.getByLabelText('Email'), 'ops@nammamedmate.com');
    await user.type(screen.getByLabelText('Password'), 'Secret123!');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByLabelText('Authenticator code')).toBeTruthy();
    await user.type(screen.getByLabelText('Authenticator code'), '123456');
    await user.click(screen.getByRole('button', { name: 'Verify' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
  });

  it('covers MFA start, login without MFA, and host-pushed errors', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => ({ ok: true }));
    render(
      <AuthMfe
        data={data(
          feature('admin', onSubmit, { initialStep: 'mfa', disabled: true }),
        )}
      />,
    );
    expect(screen.getByLabelText('Authenticator code')).toBeTruthy();
    cleanup();

    render(<AuthMfe data={data(feature('admin', onSubmit))} />);
    await user.type(screen.getByLabelText('Email'), 'ops@nammamedmate.com');
    await user.type(screen.getByLabelText('Password'), 'Secret123!');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    cleanup();

    render(
      <AuthMfe
        data={data(
          feature(
            'admin',
            async () => ({
              ok: false,
              formError: 'Bad credentials',
              fieldErrors: { email: 'Unknown email' },
            }),
            {
              initialValues: { email: 'ops@nammamedmate.com' },
              errors: { email: 'Host email' },
              formError: 'Locked out',
              disabled: true,
            },
          ),
        )}
      />,
    );
    expect(screen.getByLabelText('Email')).toHaveProperty(
      'value',
      'ops@nammamedmate.com',
    );
    cleanup();

    render(
      <AuthMfe
        data={data(
          feature('admin', async () => ({ ok: true }), {
            initialStep: 'mfa',
            errors: { code: 'Bad code' },
            formError: 'MFA locked',
          }),
        )}
      />,
    );
    expect(screen.getByLabelText('Authenticator code')).toBeTruthy();
  });
});

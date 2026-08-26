import type { AuthSubmitResult } from '@medmate/auth-contract';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature } from '../../../app/__tests__/helpers';
import AuthMfe from '../../../app/AuthMfe';

afterEach(() => {
  cleanup();
});

describe('PharmacyLoginScreen', () => {
  it('validates pharmacy login before calling onSubmit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async () => ({ ok: true }) satisfies AuthSubmitResult,
    );
    render(<AuthMfe data={data(feature('pharmacy', onSubmit))} />);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText('Enter your email or +91 mobile number.'),
    ).toBeTruthy();
  });

  it('submits pharmacy credentials and surfaces host errors', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async () =>
        ({
          ok: false,
          formError: 'Sign-in details were not recognised.',
        }) satisfies AuthSubmitResult,
    );
    const navigate = vi.fn();
    render(
      <AuthMfe
        data={{
          ...data(
            feature('pharmacy', onSubmit, {
              links: { posLogin: '/pos-login' },
              formError: 'Account locked.',
            }),
          ),
          capabilities: { navigate },
        }}
      />,
    );
    await user.type(
      screen.getByLabelText('Email or mobile'),
      'priya@srirama.in',
    );
    await user.type(screen.getByLabelText('Password'), 'Secret123!');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    expect(screen.getByTestId('login-error')).toBeTruthy();
    await user.click(
      screen.getByRole('button', { name: 'Counter PIN sign-in' }),
    );
    expect(navigate).toHaveBeenCalledWith('/pos-login');
  });

  it('covers busy, disabled, host errors, and prefilled submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => ({ ok: true }));
    render(
      <AuthMfe
        data={data(
          feature('pharmacy', onSubmit, {
            busy: true,
            disabled: true,
            errors: { identifier: 'Host error' },
          }),
        )}
      />,
    );
    cleanup();
    render(
      <AuthMfe
        data={data(
          feature('pharmacy', async () => ({ ok: true }), {
            initialValues: {
              identifier: 'priya@srirama.in',
              password: 'Secret123!',
              pharmacyId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            },
          }),
        )}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
  });
});

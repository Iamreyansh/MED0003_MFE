import type { AuthSubmitResult } from '@medmate/auth-contract';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature } from '../../../app/__tests__/helpers';
import AuthMfe from '../../../app/AuthMfe';

afterEach(() => {
  cleanup();
});

describe('PharmacyForgotScreen', () => {
  it('requests a reset and can return to sign in', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async () =>
        ({
          ok: true,
          nextStep: 'done',
        }) satisfies AuthSubmitResult,
    );
    const navigate = vi.fn();
    render(
      <AuthMfe
        data={{
          ...data(
            feature('pharmacy-forgot', onSubmit, {
              links: { login: '/login' },
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
    await user.click(screen.getByRole('button', { name: 'Request reset' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    await user.click(screen.getByRole('button', { name: 'Back to sign in' }));
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('hides the login link when the host omits it', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async () =>
        ({
          ok: true,
          nextStep: 'done',
        }) satisfies AuthSubmitResult,
    );
    render(
      <AuthMfe
        data={data(
          feature('pharmacy-forgot', onSubmit, {
            initialValues: { identifier: 'priya@srirama.in' },
          }),
        )}
      />,
    );
    expect(screen.getByLabelText('Email or mobile')).toHaveValue(
      'priya@srirama.in',
    );
    expect(
      screen.queryByRole('button', { name: 'Back to sign in' }),
    ).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Request reset' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });
});

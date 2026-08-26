import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature } from '../../../app/__tests__/helpers';
import AuthMfe from '../../../app/AuthMfe';

afterEach(() => {
  cleanup();
});

describe('TokenPasswordScreen', () => {
  it('completes admin invite and reset forms', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => ({ ok: true }));
    const { rerender } = render(
      <AuthMfe data={data(feature('admin-invite', onSubmit))} />,
    );
    await user.type(screen.getByLabelText('Invite token'), 'invite-1');
    await user.type(screen.getByLabelText('New password'), 'Secret123!');
    await user.click(screen.getByRole('button', { name: 'Save password' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    rerender(<AuthMfe data={data(feature('admin-reset', onSubmit))} />);
    await user.type(screen.getByLabelText('Reset token'), 'reset-1');
    await user.type(screen.getByLabelText('New password'), 'Secret123!');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));
  });

  it('prefills invite tokens and surfaces reset errors', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => ({ ok: true }));
    render(
      <AuthMfe
        data={data(
          feature('admin-invite', onSubmit, {
            initialValues: { inviteToken: 'prefilled' },
            disabled: true,
          }),
        )}
      />,
    );
    expect(screen.getByLabelText('Invite token')).toHaveProperty(
      'value',
      'prefilled',
    );
    cleanup();

    render(
      <AuthMfe
        data={data(
          feature(
            'admin-reset',
            async () => ({
              ok: false,
              formError: 'Token expired',
            }),
            {
              initialValues: { resetToken: 'rst' },
              formError: 'Host banner',
            },
          ),
        )}
      />,
    );
    await user.type(screen.getByLabelText('New password'), 'Secret123!');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));
    expect(await screen.findByText('Token expired')).toBeTruthy();
  });
});

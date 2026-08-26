import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature } from '../../../app/__tests__/helpers';
import AuthMfe from '../../../app/AuthMfe';

afterEach(() => {
  cleanup();
});

describe('PosLoginScreen', () => {
  it('submits a POS PIN and clears it on INVALID_PIN', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => ({
      ok: false,
      code: 'INVALID_PIN',
      formError: 'Wrong PIN',
    }));
    render(
      <AuthMfe
        data={data(
          feature('pos', onSubmit, {
            initialValues: {
              pharmacyId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
              staffId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            },
          }),
        )}
      />,
    );
    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    fireEvent.keyDown(window, { key: '3' });
    fireEvent.keyDown(window, { key: '4' });
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(screen.getByTestId('pin-display').textContent).toContain('○');
  });

  it('ignores keypad input while typing in a field and supports backspace', async () => {
    const user = userEvent.setup();
    render(<AuthMfe data={data(feature('pos'))} />);
    const pharmacy = screen.getByLabelText('Pharmacy ID');
    await user.click(pharmacy);
    fireEvent.keyDown(pharmacy, { key: '1' });
    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: 'Backspace' }));
    fireEvent.keyDown(window, { key: 'Backspace' });
    await user.click(screen.getByTestId('pin-spacer'));
    expect(screen.getByTestId('pos-login-page')).toBeTruthy();
  });

  it('trims IDs, ignores extra PIN digits, and submits a valid PIN', async () => {
    const user = userEvent.setup();
    const posOnSubmit = vi.fn(async () => ({ ok: true }));
    render(
      <AuthMfe
        data={data(
          feature('pos', posOnSubmit, {
            initialValues: { pharmacyId: '', staffId: '' },
          }),
        )}
      />,
    );
    await user.type(
      screen.getByLabelText('Pharmacy ID'),
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    );
    await user.type(
      screen.getByLabelText('Staff ID'),
      '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    );
    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    cleanup();
    render(
      <AuthMfe
        data={data(
          feature('pos', async () => ({ ok: true }), {
            initialValues: {
              pharmacyId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
              staffId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            },
          }),
        )}
      />,
    );
    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: '3' }));
    await user.click(screen.getByRole('button', { name: '4' }));
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
  });
});

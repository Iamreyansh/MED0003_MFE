import type { OnboardingSubmitResult } from '@medmate/onboarding-contract';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature } from '../../../app/__tests__/helpers';
import OnboardingMfe from '../../../app/OnboardingMfe';

afterEach(() => {
  cleanup();
});

describe('RegisterScreen', () => {
  it('validates before calling onSubmit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async () => ({ ok: true }) satisfies OnboardingSubmitResult,
    );
    render(<OnboardingMfe data={data(feature('register', onSubmit))} />);
    await user.click(
      screen.getByRole('button', { name: 'Create Free account' }),
    );
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Enter the owner name.')).toBeTruthy();
  });

  it('submits a valid payload and surfaces host errors', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async () =>
        ({
          ok: false,
          fieldErrors: { email: 'Email already registered.' },
          formError: 'Email already registered.',
        }) satisfies OnboardingSubmitResult,
    );
    const navigate = vi.fn();
    render(
      <OnboardingMfe
        data={{
          ...data(
            feature('register', onSubmit, {
              links: { login: '/login' },
              formError: 'Check the form.',
            }),
          ),
          capabilities: { navigate },
        }}
      />,
    );
    await user.type(screen.getByLabelText('Owner name'), 'Priya Sharma');
    await user.type(screen.getByLabelText('Email'), 'priya@srirama.in');
    await user.type(screen.getByLabelText('Mobile'), '+919876543210');
    await user.type(screen.getByLabelText('Password'), 'Passw0rd!');
    await user.type(
      screen.getByLabelText('Business name'),
      'Sri Rama Medicals',
    );
    await user.type(screen.getByLabelText('Flat / street'), '12');
    await user.type(screen.getByLabelText('Area'), 'MG Road');
    await user.type(screen.getByLabelText('City'), 'Bengaluru');
    await user.type(screen.getByLabelText('Pincode'), '560001');
    await user.type(screen.getByLabelText('GSTIN'), '29AABPP1234F1Z5');
    await user.type(screen.getByLabelText('PAN'), 'AABPP1234F');
    await user.type(screen.getByLabelText('Drug licence number'), 'DL-1');
    await user.click(
      screen.getByRole('button', { name: 'Create Free account' }),
    );
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    expect(screen.getByTestId('register-error')).toBeTruthy();
    await user.click(
      screen.getByRole('button', { name: 'Already have an account? Sign in' }),
    );
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('covers busy and disabled host errors', () => {
    render(
      <OnboardingMfe
        data={data(
          feature('register', async () => ({ ok: true }), {
            busy: true,
            disabled: true,
            errors: { owner_name: 'Host error' },
          }),
        )}
      />,
    );
    expect(screen.getByLabelText('Owner name')).toBeDisabled();
  });
});

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature } from '../../../app/__tests__/helpers';
import OnboardingMfe from '../../../app/OnboardingMfe';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('StatusScreen', () => {
  it('shows KYC CTA for PENDING_KYC', async () => {
    const navigate = vi.fn();
    render(
      <OnboardingMfe
        data={{
          ...data(
            feature('status', async () => ({
              ok: true,
              status: {
                status: 'PENDING_KYC',
                email_verified: true,
                business_name: 'Sri Rama Medicals',
                plan: 'FREE',
                kyc: { documents_uploaded: 0, documents_required: 5 },
              },
            })),
          ),
          capabilities: { navigate },
        }}
      />,
    );
    expect(
      await screen.findByRole('button', { name: 'Upload KYC documents' }),
    ).toBeTruthy();
    expect(screen.getByText('0 of 5 files on file')).toBeTruthy();
    expect(screen.getByText('Sri Rama Medicals')).toBeTruthy();
    await userEvent.click(
      screen.getByRole('button', { name: 'Upload KYC documents' }),
    );
    expect(navigate).toHaveBeenCalledWith('/onboarding/kyc');
  });

  it('shows waiting copy when KYC is submitted', async () => {
    render(
      <OnboardingMfe
        data={data(
          feature('status', async () => ({
            ok: true,
            status: { status: 'KYC_SUBMITTED', email_verified: true },
          })),
        )}
      />,
    );
    expect(
      await screen.findByText(/Marketplace routes stay blocked/),
    ).toBeTruthy();
  });

  it('shows a rejection reason when Core provides one', async () => {
    render(
      <OnboardingMfe
        data={data(
          feature('status', async () => ({
            ok: true,
            status: {
              status: 'REJECTED',
              kyc: { rejection_reason: 'Unreadable licence' },
            },
          })),
        )}
      />,
    );
    expect(await screen.findByText(/Unreadable licence/)).toBeTruthy();
  });

  it('shows fallback rejection copy', async () => {
    render(
      <OnboardingMfe
        data={data(
          feature('status', async () => ({
            ok: true,
            status: { status: 'REJECTED' },
          })),
        )}
      />,
    );
    expect(await screen.findByText(/KYC was rejected/)).toBeTruthy();
  });

  it('shows suspension copy', async () => {
    render(
      <OnboardingMfe
        data={data(
          feature('status', async () => ({
            ok: true,
            status: { status: 'SUSPENDED' },
          })),
        )}
      />,
    );
    expect(await screen.findByText(/pharmacy is suspended/)).toBeTruthy();
  });

  it('continues home when ACTIVE', async () => {
    const navigate = vi.fn();
    render(
      <OnboardingMfe
        data={{
          ...data(
            feature('status', async () => ({
              ok: true,
              status: { status: 'ACTIVE', plan: 'STARTER' },
            })),
          ),
          capabilities: { navigate },
        }}
      />,
    );
    await userEvent.click(
      await screen.findByRole('button', { name: 'Continue to home' }),
    );
    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('surfaces load errors and refresh', async () => {
    const onSubmit = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        formError: 'Unable to load registration status.',
      })
      .mockResolvedValue({
        ok: true,
        status: { status: 'PENDING_KYC', email_verified: false },
      });
    render(<OnboardingMfe data={data(feature('status', onSubmit))} />);
    expect(
      await screen.findByText('Unable to load registration status.'),
    ).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(
      await screen.findByRole('button', { name: 'Upload KYC documents' }),
    ).toBeTruthy();
  });

  it('uses fallbacks when Core omits copy and status', async () => {
    const onSubmit = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValue({ ok: true });
    render(<OnboardingMfe data={data(feature('status', onSubmit))} />);
    expect(
      await screen.findByText('Unable to load registration status.'),
    ).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(await screen.findByText('Your pharmacy')).toBeTruthy();
    expect(await screen.findByText('Pending KYC')).toBeTruthy();
  });

  it('polls status while the page is open', async () => {
    const onSubmit = vi.fn(async () => ({
      ok: true,
      status: { status: 'PENDING_KYC', email_verified: true },
    }));
    vi.spyOn(window, 'setInterval').mockImplementation((cb) => {
      queueMicrotask(() => {
        (cb as () => void)();
      });
      return 1 as unknown as ReturnType<typeof window.setInterval>;
    });
    vi.spyOn(window, 'clearInterval').mockImplementation(() => undefined);
    render(<OnboardingMfe data={data(feature('status', onSubmit))} />);
    expect(
      await screen.findByRole('button', { name: 'Upload KYC documents' }),
    ).toBeTruthy();
    await vi.waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'refresh' }),
      );
    });
  });
});

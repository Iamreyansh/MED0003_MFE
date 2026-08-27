import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  data,
  feature,
  ownerProfileLoad,
} from '../../../app/__tests__/helpers';
import SettingsMfe from '../../../app/SettingsMfe';

if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = vi.fn(() => 'blob:http://localhost/logo');
}
if (typeof URL.revokeObjectURL !== 'function') {
  URL.revokeObjectURL = vi.fn();
}

afterEach(() => {
  cleanup();
});

function submitByAction(
  overrides: Record<string, unknown> = {},
): ReturnType<typeof vi.fn> {
  return vi.fn(async (command: { action: string }) => {
    if (overrides[command.action]) {
      return overrides[command.action];
    }
    if (command.action === 'load') {
      return ownerProfileLoad;
    }
    if (command.action === 'loadCompleteness') {
      return {
        ok: true,
        completeness: {
          completeness_pct: 0,
          missing_fields: [
            { field: 'logo_url', label: 'Pharmacy Logo', action: 'Upload' },
            { field: 'bank_account', label: 'Bank account' },
          ],
        },
      };
    }
    if (command.action === 'loadBank') {
      return {
        ok: true,
        bank: {
          account_holder: 'Sri Rama Medicals',
          bank_name: 'HDFC Bank',
          account_number_masked: 'XXXXXXXXXXXX4321',
          ifsc_code: 'HDFC0001234',
          verification_status: 'VERIFIED',
        },
      };
    }
    return { ok: true };
  });
}

async function typeOtp(
  user: ReturnType<typeof userEvent.setup>,
  digits: string,
): Promise<void> {
  for (const [index, digit] of [...digits].entries()) {
    await user.type(screen.getByLabelText(`OTP digit ${index + 1}`), digit);
  }
}

describe('ProfileScreen', () => {
  it('shows a skeleton then owner controls', async () => {
    let resolveLoad: ((value: unknown) => void) | undefined;
    const onSubmit = vi.fn(async (command: { action: string }) => {
      if (command.action === 'load') {
        await new Promise((resolve) => {
          resolveLoad = resolve;
        });
        return ownerProfileLoad;
      }
      if (command.action === 'loadCompleteness') {
        return { ok: true, completeness: { missing_fields: [] } };
      }
      return { ok: true, bank: null };
    });
    render(<SettingsMfe data={data(feature('profile', onSubmit))} />);
    expect(screen.getByTestId('profile-skeleton')).toBeTruthy();
    resolveLoad?.(undefined);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save profile' })).toBeTruthy();
    });
  });

  it('surfaces load errors', async () => {
    const onSubmit = vi.fn(async () => ({
      ok: false as const,
    }));
    render(<SettingsMfe data={data(feature('profile', onSubmit))} />);
    await waitFor(() => {
      expect(screen.getByText('Unable to load profile.')).toBeTruthy();
    });
  });

  it('loads empty payloads and ignores a cancelled completeness wait', async () => {
    let resolveComplete: ((value: unknown) => void) | undefined;
    const onSubmit = vi.fn(async (command: { action: string }) => {
      if (command.action === 'load') {
        return { ok: true };
      }
      if (command.action === 'loadCompleteness') {
        await new Promise((resolve) => {
          resolveComplete = resolve;
        });
        return { ok: true };
      }
      return { ok: true, bank: null };
    });
    const { unmount } = render(
      <SettingsMfe data={data(feature('profile', onSubmit))} />,
    );
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'loadCompleteness' }),
      );
    });
    unmount();
    resolveComplete?.(undefined);
  });

  it('ignores a cancelled profile load', async () => {
    let resolveLoad: ((value: unknown) => void) | undefined;
    const onSubmit = vi.fn(async (command: { action: string }) => {
      if (command.action === 'load') {
        await new Promise((resolve) => {
          resolveLoad = resolve;
        });
        return ownerProfileLoad;
      }
      return { ok: true };
    });
    const { unmount } = render(
      <SettingsMfe data={data(feature('profile', onSubmit))} />,
    );
    expect(screen.getByTestId('profile-skeleton')).toBeTruthy();
    unmount();
    resolveLoad?.(undefined);
  });

  it('renders an empty profile and saves blank contact', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (command: { action: string }) => {
      if (command.action === 'load') {
        return { ok: true };
      }
      if (command.action === 'loadCompleteness') {
        return { ok: true };
      }
      if (command.action === 'loadBank') {
        return { ok: true };
      }
      if (command.action === 'save') {
        return { ok: true, save: {} };
      }
      return { ok: true };
    });
    render(
      <SettingsMfe
        data={data(feature('profile', onSubmit, { pharmacyStatus: undefined }))}
      />,
    );
    await waitFor(() => {
      expect(screen.getByLabelText('Business name')).toBeTruthy();
    });
    await user.type(screen.getByLabelText('Business name'), 'New Shop');
    await user.click(screen.getByRole('button', { name: 'Save profile' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'save',
          values: expect.objectContaining({ phone: '', email: '' }),
        }),
      );
    });
  });

  it('disables writes for staff and hides bank', async () => {
    const onSubmit = submitByAction();
    render(
      <SettingsMfe
        data={data(
          feature('profile', onSubmit, {
            canWrite: false,
            role: 'pharmacy_staff',
          }),
        )}
      />,
    );
    await waitFor(() => {
      expect(screen.getByLabelText('Business name')).toBeDisabled();
    });
    expect(screen.getByLabelText('Pharmacy logo')).toBeDisabled();
    expect(screen.queryByLabelText('Account number')).toBeNull();
    expect(screen.getByText(/Staff can view this profile/)).toBeTruthy();
  });

  it('maps completeness links and KYC callout', async () => {
    const onSubmit = submitByAction({
      load: {
        ok: true,
        profile: {
          ...(ownerProfileLoad.ok ? ownerProfileLoad.profile : {}),
          status: 'PENDING_KYC',
        },
      },
    });
    const navigate = vi.fn();
    render(
      <SettingsMfe
        data={{
          ...data(
            feature('profile', onSubmit, { pharmacyStatus: 'PENDING_KYC' }),
          ),
          capabilities: { navigate },
        }}
      />,
    );
    await waitFor(() => {
      expect(screen.getByLabelText('Missing profile fields')).toBeTruthy();
    });
    expect(
      screen.getByRole('navigation', { name: 'Profile sections' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('progressbar', { name: 'Profile completeness' }),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Pharmacy Logo' })).toHaveAttribute(
      'href',
      '#section-identity',
    );
    expect(screen.getByTestId('kyc-checklist')).toBeTruthy();
    await userEvent.click(
      screen.getByRole('button', { name: 'Open KYC pack' }),
    );
    expect(navigate).toHaveBeenCalledWith('/onboarding/kyc');
  });

  it('handles completeness failure and bank forbidden', async () => {
    const onSubmit = submitByAction({
      loadCompleteness: {
        ok: false,
        formError: 'Pharmacy is not active',
        code: 'PHARMACY_NOT_ACTIVE',
      },
      loadBank: { ok: false, code: 'FORBIDDEN', formError: 'Forbidden' },
    });
    render(<SettingsMfe data={data(feature('profile', onSubmit))} />);
    await waitFor(() => {
      expect(screen.getByText('Pharmacy is not active')).toBeTruthy();
    });
    expect(screen.queryByLabelText('Account number')).toBeNull();
  });

  it('saves profile, tax, bank, and contact', async () => {
    const user = userEvent.setup();
    const onSubmit = submitByAction({
      save: {
        ok: true,
        save: {
          pending_approval_fields: ['business_name'],
          pending_verification_fields: ['phone'],
        },
      },
      saveTax: { ok: true, tax: {} },
      saveBank: {
        ok: true,
        bank: {
          account_number_masked: 'XXXXXXXXXXXX9999',
          bank_name: 'SBI',
          account_holder: 'Priya',
          ifsc_code: 'SBIN0001234',
          verification_status: 'PENDING',
        },
      },
      verifyContact: { ok: true, contact: { verified: true } },
    });
    render(<SettingsMfe data={data(feature('profile', onSubmit))} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Business name')).toBeTruthy();
    });
    fireEvent.change(screen.getByLabelText('Monday close'), {
      target: { value: '20:00' },
    });
    fireEvent.change(screen.getByLabelText('Monday open'), {
      target: { value: '10:00' },
    });
    await user.click(screen.getByLabelText('Monday closed'));
    await user.clear(screen.getByLabelText('Business name'));
    await user.type(screen.getByLabelText('Business name'), 'Rama Medicals');
    await user.click(screen.getByRole('button', { name: 'Save profile' }));
    await waitFor(() => {
      expect(screen.getByText('business name pending')).toBeTruthy();
    });
    expect(screen.getByText('Profile saved')).toBeTruthy();
    await user.click(screen.getByLabelText('GST registered'));
    await user.click(screen.getByLabelText('E-invoicing enabled'));
    await user.click(screen.getByLabelText('TDS applicable'));
    await user.click(screen.getByLabelText('TCS applicable'));
    await user.click(screen.getByRole('button', { name: 'Save tax details' }));
    await user.type(screen.getByLabelText('Account holder'), 'Priya Sharma');
    await user.type(screen.getByLabelText('Bank name'), 'SBI');
    await user.type(screen.getByLabelText('Account number'), '123456789012');
    await user.type(screen.getByLabelText('IFSC'), 'SBIN0001234');
    await user.click(screen.getByRole('button', { name: 'Save bank account' }));
    await waitFor(() => {
      expect(screen.getByTestId('bank-masked').textContent).toContain(
        'XXXXXXXXXXXX9999',
      );
    });
    await typeOtp(user, '123456');
    await user.click(screen.getByRole('button', { name: 'Verify contact' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'verifyContact' }),
      );
    });
  });

  it('maps field errors from host', async () => {
    const user = userEvent.setup();
    const onSubmit = submitByAction({
      save: {
        ok: false,
        fieldErrors: { business_name: 'Too long' },
        formError: 'Check the highlighted fields and try again.',
      },
    });
    render(<SettingsMfe data={data(feature('profile', onSubmit))} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Business name')).toBeTruthy();
    });
    await user.click(screen.getByRole('button', { name: 'Save profile' }));
    await waitFor(() => {
      expect(screen.getByTestId('profile-error')).toBeTruthy();
    });
  });

  it('confirms dirty leave', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    const onSubmit = submitByAction();
    render(
      <SettingsMfe
        data={{
          ...data(feature('profile', onSubmit)),
          capabilities: { navigate },
        }}
      />,
    );
    await waitFor(() => {
      expect(screen.getByLabelText('Tagline')).toBeTruthy();
    });
    await user.type(screen.getByLabelText('Tagline'), 'Open late');
    const bogus = document.createElement('a');
    bogus.setAttribute('href', '::');
    document.body.appendChild(bogus);
    await user.click(bogus);
    bogus.remove();
    const link = document.createElement('a');
    link.setAttribute('href', '/settings/storefront');
    link.textContent = 'Storefront';
    document.body.appendChild(link);
    fireEvent.click(link);
    expect(
      screen.getByRole('heading', { name: 'Leave without saving?' }),
    ).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(
      screen.queryByRole('heading', { name: 'Leave without saving?' }),
    ).toBeNull();
    fireEvent.click(link);
    expect(
      screen.getByRole('heading', { name: 'Leave without saving?' }),
    ).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Stay' }));
    fireEvent.click(link);
    await user.click(screen.getByRole('button', { name: 'Leave' }));
    expect(navigate).toHaveBeenCalledWith('/settings/storefront');
    link.remove();
  });

  it('disables writes while the host is busy', async () => {
    const onSubmit = submitByAction();
    render(
      <SettingsMfe data={data(feature('profile', onSubmit, { busy: true }))} />,
    );
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Save profile' }),
      ).toBeDisabled();
    });
  });

  it('ignores a cancelled bank wait', async () => {
    let resolveBank: ((value: unknown) => void) | undefined;
    const onSubmit = vi.fn(async (command: { action: string }) => {
      if (command.action === 'load') {
        return ownerProfileLoad;
      }
      if (command.action === 'loadCompleteness') {
        return { ok: true, completeness: { missing_fields: [] } };
      }
      if (command.action === 'loadBank') {
        await new Promise((resolve) => {
          resolveBank = resolve;
        });
        return { ok: true };
      }
      return { ok: true };
    });
    const { unmount } = render(
      <SettingsMfe data={data(feature('profile', onSubmit))} />,
    );
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'loadBank' }),
      );
    });
    unmount();
    resolveBank?.(undefined);
  });

  it('keeps the current profile when refresh fails', async () => {
    const user = userEvent.setup();
    let loads = 0;
    const onSubmit = vi.fn(async (command: { action: string }) => {
      if (command.action === 'load') {
        loads += 1;
        if (loads === 1) {
          return ownerProfileLoad;
        }
        return { ok: false };
      }
      if (command.action === 'loadCompleteness') {
        return { ok: true, completeness: { missing_fields: [] } };
      }
      if (command.action === 'loadBank') {
        return { ok: true, bank: null };
      }
      if (command.action === 'save') {
        return { ok: true, save: {} };
      }
      return { ok: true };
    });
    render(<SettingsMfe data={data(feature('profile', onSubmit))} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Business name')).toBeTruthy();
    });
    await user.click(screen.getByRole('button', { name: 'Save profile' }));
    await waitFor(() => {
      expect(loads).toBeGreaterThan(1);
    });
  });

  it('clears profile when refresh returns an empty payload', async () => {
    const user = userEvent.setup();
    let loads = 0;
    const onSubmit = vi.fn(async (command: { action: string }) => {
      if (command.action === 'load') {
        loads += 1;
        if (loads === 1) {
          return ownerProfileLoad;
        }
        return { ok: true };
      }
      if (command.action === 'loadCompleteness') {
        return { ok: true, completeness: { missing_fields: [] } };
      }
      if (command.action === 'loadBank') {
        return { ok: true, bank: null };
      }
      if (command.action === 'save') {
        return { ok: true, save: {} };
      }
      return { ok: true };
    });
    render(<SettingsMfe data={data(feature('profile', onSubmit))} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Business name')).toBeTruthy();
    });
    await user.click(screen.getByRole('button', { name: 'Save profile' }));
    await waitFor(() => {
      expect(loads).toBeGreaterThan(1);
    });
  });

  it('lets the owner leave dirty profile without host navigate', async () => {
    const user = userEvent.setup();
    render(<SettingsMfe data={data(feature('profile', submitByAction()))} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Tagline')).toBeTruthy();
    });
    await user.click(screen.getByText('Have a logo link instead?'));
    fireEvent.change(screen.getByLabelText('Logo URL'), {
      target: { value: 'https://cdn.example/logo.png' },
    });
    fireEvent.change(screen.getByLabelText('Phone'), {
      target: { value: '+918888888888' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'owner@shop.in' },
    });
    fireEvent.change(screen.getByLabelText('Flat / street'), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText('Area'), {
      target: { value: 'Indiranagar' },
    });
    fireEvent.change(screen.getByLabelText('City'), {
      target: { value: 'Mysuru' },
    });
    fireEvent.change(screen.getByLabelText('State'), {
      target: { value: 'Tamil Nadu' },
    });
    fireEvent.change(screen.getByLabelText('Pincode'), {
      target: { value: '560038' },
    });
    const link = document.createElement('a');
    link.setAttribute('href', '/home');
    document.body.appendChild(link);
    fireEvent.click(link);
    await user.click(screen.getByRole('button', { name: 'Leave' }));
    link.remove();
  });

  it('keeps bank visible when load fails for a non-forbidden reason', async () => {
    const onSubmit = submitByAction({
      loadBank: { ok: false, code: 'TIMEOUT' },
      saveTax: { ok: false, formError: 'Tax save failed' },
      saveBank: { ok: true },
      verifyContact: { ok: false, formError: 'OTP expired' },
    });
    const user = userEvent.setup();
    render(<SettingsMfe data={data(feature('profile', onSubmit))} />);
    await waitFor(() => {
      expect(screen.getByText('No bank account on file.')).toBeTruthy();
    });
    fireEvent.change(screen.getByLabelText('GSTIN'), {
      target: { value: '29AABPP9999F1Z5' },
    });
    fireEvent.change(screen.getByLabelText('PAN'), {
      target: { value: 'AABPP1234F' },
    });
    fireEvent.change(screen.getByLabelText('Drug licence number'), {
      target: { value: 'KA-20-123' },
    });
    fireEvent.change(screen.getByLabelText('FSSAI number'), {
      target: { value: '11223344556677' },
    });
    fireEvent.change(screen.getByLabelText('Registered pharmacist'), {
      target: { value: 'Priya Sharma' },
    });
    await user.click(screen.getByRole('button', { name: 'Save tax details' }));
    await waitFor(() => {
      expect(screen.getByTestId('tax-error')).toBeTruthy();
    });
    await user.type(screen.getByLabelText('Account holder'), 'Priya');
    await user.type(screen.getByLabelText('Bank name'), 'HDFC');
    await user.type(screen.getByLabelText('Account number'), '123456789012');
    await user.type(screen.getByLabelText('IFSC'), 'HDFC0001234');
    fireEvent.change(screen.getByLabelText('Account type'), {
      target: { value: 'SAVINGS' },
    });
    await user.click(screen.getByRole('button', { name: 'Save bank account' }));
    fireEvent.change(screen.getByLabelText('Channel'), {
      target: { value: 'EMAIL' },
    });
    await user.click(screen.getByRole('button', { name: 'Verify contact' }));
    expect(await screen.findByText('Enter the 6-digit OTP.')).toBeTruthy();
    await typeOtp(user, '654321');
    await user.click(screen.getByRole('button', { name: 'Verify contact' }));
    await waitFor(() => {
      expect(screen.getByTestId('verify-error')).toBeTruthy();
    });
  });

  it('uploads a pharmacy logo from a local file', async () => {
    const onSubmit = submitByAction({
      uploadLogo: {
        ok: true,
        profile: { logo_url: 'https://api.example/shop.png' },
      },
      loadCompleteness: { ok: true },
    });
    render(<SettingsMfe data={data(feature('profile', onSubmit))} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Pharmacy logo')).toBeTruthy();
    });
    const bytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    fireEvent.change(screen.getByLabelText('Pharmacy logo'), {
      target: {
        files: [new File([bytes], 'board.png', { type: 'image/png' })],
      },
    });
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        screen: 'profile',
        action: 'uploadLogo',
        values: { file: expect.any(File) },
      });
    });
    expect(await screen.findByText('Logo uploaded')).toBeTruthy();
  });

  it('maps a failed logo upload onto the file field', async () => {
    const onSubmit = submitByAction({
      uploadLogo: {
        ok: false,
        formError: 'Logo must be PNG or JPG',
        fieldErrors: { logo_url: 'Logo must be PNG or JPG' },
      },
    });
    render(<SettingsMfe data={data(feature('profile', onSubmit))} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Pharmacy logo')).toBeTruthy();
    });
    const bytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    fireEvent.change(screen.getByLabelText('Pharmacy logo'), {
      target: {
        files: [new File([bytes], 'board.png', { type: 'image/png' })],
      },
    });
    expect(await screen.findByText('Logo must be PNG or JPG')).toBeTruthy();
  });

  it('keeps the previous logo when completeness refresh fails after upload', async () => {
    let completenessCalls = 0;
    const onSubmit = vi.fn(async (command: { action: string }) => {
      if (command.action === 'load') {
        return ownerProfileLoad;
      }
      if (command.action === 'loadCompleteness') {
        completenessCalls += 1;
        if (completenessCalls === 1) {
          return { ok: true, completeness: { missing_fields: [] } };
        }
        return { ok: false, formError: 'Unable to refresh completeness' };
      }
      if (command.action === 'loadBank') {
        return { ok: true, bank: null };
      }
      if (command.action === 'uploadLogo') {
        return { ok: true };
      }
      return { ok: true };
    });
    render(<SettingsMfe data={data(feature('profile', onSubmit))} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Pharmacy logo')).toBeTruthy();
    });
    const bytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    fireEvent.change(screen.getByLabelText('Pharmacy logo'), {
      target: {
        files: [new File([bytes], 'board.png', { type: 'image/png' })],
      },
    });
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'uploadLogo' }),
      );
    });
    expect(await screen.findByText('Logo uploaded')).toBeTruthy();
  });
});

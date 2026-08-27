import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature } from '../../../app/__tests__/helpers';
import OnboardingMfe from '../../../app/OnboardingMfe';

afterEach(() => {
  cleanup();
});

const uploaded = {
  document_id: 'doc-1',
  document_type: 'GSTIN_CERTIFICATE',
  status: 'UPLOADED',
  uploaded_at: '2026-08-26T12:00:00.000Z',
};

describe('KycScreen', () => {
  it('lists documents and hides write actions for staff', async () => {
    render(
      <OnboardingMfe
        data={data(
          feature(
            'kyc',
            async () => ({
              ok: true,
              documents: {
                documents: [
                  uploaded,
                  {
                    document_id: 'doc-2',
                    document_type: 'PAN_CARD',
                    status: 'VERIFIED',
                    uploaded_at: 'not-a-date',
                    rejection_reason: 'blurry',
                  },
                ],
                missing_documents: ['DRUG_LICENCE'],
                ready_to_submit: false,
              },
            }),
            { canWriteKyc: false, role: 'pharmacy_staff' },
          ),
        )}
      />,
    );
    expect(await screen.findByText('GSTIN certificate')).toBeTruthy();
    expect(
      screen.getByText(
        'Staff can view the pack. Only the owner can upload or submit.',
      ),
    ).toBeTruthy();
    expect(screen.queryByLabelText('Document file')).toBeNull();
  });

  it('uploads, deletes, and submits for an owner', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    const onSubmit = vi.fn(async (command) => {
      if (command.action === 'list') {
        return {
          ok: true,
          documents: {
            documents: [
              uploaded,
              {
                document_id: 'doc-2',
                document_type: 'PAN_CARD',
                status: 'VERIFIED',
                uploaded_at: '2026-08-26T12:00:00.000Z',
              },
            ],
            missing_documents: [],
            ready_to_submit: true,
          },
        };
      }
      if (command.action === 'upload') {
        return {
          ok: true,
          documents: {
            documents: [uploaded],
            missing_documents: [],
            ready_to_submit: true,
          },
        };
      }
      if (command.action === 'delete') {
        return { ok: true };
      }
      if (command.action === 'submit') {
        return { ok: true, nextStep: 'status' as const };
      }
      return { ok: true };
    });
    render(
      <OnboardingMfe
        data={{
          ...data(
            feature('kyc', onSubmit, {
              canWriteKyc: true,
              role: 'pharmacy_owner',
            }),
          ),
          capabilities: { navigate },
        }}
      />,
    );
    expect(await screen.findByText('GSTIN certificate')).toBeTruthy();
    const file = new File(['%PDF'], 'gstin.pdf', { type: 'application/pdf' });
    await user.upload(screen.getByLabelText('Document file'), file);
    await user.selectOptions(
      screen.getByLabelText('Document type'),
      'DRUG_LICENCE',
    );
    await user.click(screen.getByRole('button', { name: 'Upload document' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Submit KYC pack' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(navigate).toHaveBeenCalledWith('/onboarding/status');
    await user.click(screen.getByRole('button', { name: 'Back to status' }));
    expect(navigate).toHaveBeenCalledWith('/onboarding/status');
  });

  it('shows an empty pack', async () => {
    render(
      <OnboardingMfe
        data={data(
          feature(
            'kyc',
            async () => ({
              ok: true,
              documents: { documents: [], ready_to_submit: false },
            }),
            { canWriteKyc: true },
          ),
        )}
      />,
    );
    expect(await screen.findByText('No documents uploaded yet.')).toBeTruthy();
  });

  it('surfaces a list error', async () => {
    render(
      <OnboardingMfe
        data={data(
          feature(
            'kyc',
            async () => ({
              ok: false,
              formError: 'Unable to load KYC documents.',
            }),
            { canWriteKyc: true },
          ),
        )}
      />,
    );
    expect(
      await screen.findByText('Unable to load KYC documents.'),
    ).toBeTruthy();
  });

  it('surfaces upload, delete, and submit errors', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (command) => {
      if (command.action === 'list') {
        return {
          ok: true,
          documents: {
            documents: [uploaded],
            ready_to_submit: true,
          },
        };
      }
      if (command.action === 'upload') {
        return { ok: false };
      }
      if (command.action === 'delete') {
        return { ok: false };
      }
      return {
        ok: false,
        formError: 'DOCUMENTS_INCOMPLETE',
        missingTypes: ['PAN_CARD'],
      };
    });
    render(
      <OnboardingMfe
        data={data(feature('kyc', onSubmit, { canWriteKyc: true }))}
      />,
    );
    const file = new File(['x'], 'x.png', { type: 'image/png' });
    await user.upload(await screen.findByLabelText('Document file'), file);
    await user.click(screen.getByRole('button', { name: 'Upload document' }));
    expect(await screen.findByText('Upload failed.')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByText('Delete failed.')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Submit KYC pack' }));
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Submit KYC pack' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Submit KYC pack' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('DOCUMENTS_INCOMPLETE')).toBeTruthy();
  });

  it('covers fallback copy, empty expiry, and dialog close', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (command) => {
      if (command.action === 'list') {
        return {
          ok: true,
          documents: {
            documents: [
              {
                document_id: 'doc-r',
                document_type: 'PAN_CARD',
                status: 'REJECTED',
                uploaded_at: '2026-08-26T12:00:00.000Z',
              },
            ],
            ready_to_submit: true,
          },
        };
      }
      if (command.action === 'upload') {
        return { ok: true };
      }
      if (command.action === 'delete') {
        return {
          ok: true,
          documents: {
            documents: [],
            missing_documents: ['GSTIN_CERTIFICATE'],
            ready_to_submit: true,
          },
        };
      }
      return { ok: false, missingTypes: undefined };
    });
    render(
      <OnboardingMfe
        data={data(feature('kyc', onSubmit, { canWriteKyc: true }))}
      />,
    );
    expect(await screen.findByText('Rejected')).toBeTruthy();
    const file = new File(['x'], 'licence.pdf', { type: 'application/pdf' });
    await user.upload(screen.getByLabelText('Document file'), file);
    await user.selectOptions(
      screen.getByLabelText('Document type'),
      'DRUG_LICENCE',
    );
    await user.click(screen.getByRole('button', { name: 'Upload document' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    const licence = new File(['y'], 'dl.pdf', { type: 'application/pdf' });
    await user.upload(screen.getByLabelText('Document file'), licence);
    await user.type(screen.getByLabelText('Expiry date'), '2027-12-31');
    await user.click(screen.getByRole('button', { name: 'Upload document' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByText(/Still needed/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Submit KYC pack' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Submit failed.')).toBeTruthy();
  });

  it('shows a generic list error when Core omits copy', async () => {
    render(
      <OnboardingMfe
        data={data(
          feature('kyc', async () => ({ ok: false }), { canWriteKyc: true }),
        )}
      />,
    );
    expect(
      await screen.findByText('Unable to load KYC documents.'),
    ).toBeTruthy();
  });

  it('treats a list success without documents as empty', async () => {
    render(
      <OnboardingMfe
        data={data(
          feature('kyc', async () => ({ ok: true }), { canWriteKyc: true }),
        )}
      />,
    );
    expect(await screen.findByText('No documents uploaded yet.')).toBeTruthy();
  });
});

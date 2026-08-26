import { cleanup, render, waitFor } from '@testing-library/react';
import { Formik, useFormikContext } from 'formik';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applySubmitResult,
  asStatusMessage,
  useHostFormState,
} from '../submit';

afterEach(() => {
  cleanup();
});

function HostProbe({
  errors,
  formError,
}: {
  errors?: Record<string, string>;
  formError?: string;
}) {
  const {
    setErrors,
    setStatus,
    errors: fieldErrors,
    status,
  } = useFormikContext<{ a: string }>();
  useHostFormState(setErrors, setStatus, errors, formError);
  return (
    <div>
      <span data-testid="err">{fieldErrors.a ?? ''}</span>
      <span data-testid="status">{String(status ?? '')}</span>
    </div>
  );
}

describe('submit helpers', () => {
  it('returns only string Formik status as a message', () => {
    expect(asStatusMessage('Locked')).toBe('Locked');
    expect(asStatusMessage(undefined)).toBeUndefined();
    expect(asStatusMessage({ code: 'x' })).toBeUndefined();
  });

  it('maps success and failure results', () => {
    const helpers = {
      setStatus: vi.fn(),
      setErrors: vi.fn(),
    };
    applySubmitResult({ ok: true }, helpers as never);
    expect(helpers.setStatus).toHaveBeenCalledWith(undefined);
    applySubmitResult(
      { ok: false, fieldErrors: { identifier: 'bad' }, formError: 'Nope' },
      helpers as never,
      document.createElement('form'),
    );
    expect(helpers.setErrors).toHaveBeenCalled();
    applySubmitResult({ ok: false, retryAfterSeconds: 9 }, helpers as never);
    expect(helpers.setStatus).toHaveBeenCalledWith(
      'Too many attempts. Retry in 9s.',
    );
    applySubmitResult({ ok: false }, helpers as never);
    expect(helpers.setStatus).toHaveBeenCalledWith(undefined);
  });

  it('syncs host-pushed errors into Formik', async () => {
    const { rerender, getByTestId } = render(
      <Formik initialValues={{ a: '' }} onSubmit={vi.fn()}>
        <HostProbe />
      </Formik>,
    );
    rerender(
      <Formik initialValues={{ a: '' }} onSubmit={vi.fn()}>
        <HostProbe errors={{ a: 'Required' }} formError="Locked" />
      </Formik>,
    );
    await waitFor(() => {
      expect(getByTestId('err').textContent).toBe('Required');
      expect(getByTestId('status').textContent).toBe('Locked');
    });
  });
});

import type { FormikHelpers } from 'formik';
import { describe, expect, it, vi } from 'vitest';
import { applySubmitResult, asStatusMessage } from '../submit';

describe('applySubmitResult', () => {
  it('clears status on success and maps failures', () => {
    const helpers = {
      setStatus: vi.fn(),
      setErrors: vi.fn(),
    } as unknown as FormikHelpers<{ email: string }>;
    expect(applySubmitResult({ ok: true }, helpers, null).ok).toBe(true);
    applySubmitResult({ ok: false }, helpers, null);
    applySubmitResult(
      { ok: false, formError: 'Unable to continue.' },
      helpers,
      null,
    );
    applySubmitResult(
      {
        ok: false,
        fieldErrors: { email: 'Required' },
        retryAfterSeconds: 3,
      },
      helpers,
      null,
    );
    expect(helpers.setErrors).toHaveBeenCalled();
    expect(asStatusMessage('banner')).toBe('banner');
    expect(asStatusMessage(1)).toBeUndefined();
  });
});

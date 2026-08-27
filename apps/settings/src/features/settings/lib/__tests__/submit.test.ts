import { describe, expect, it, vi } from 'vitest';
import { applySubmitResult, asStatusMessage } from '../submit';

describe('applySubmitResult', () => {
  it('clears status on success and maps field errors', () => {
    const helpers = {
      setStatus: vi.fn(),
      setErrors: vi.fn(),
    };
    const ok = applySubmitResult(
      { ok: true },
      helpers as never,
      document.createElement('form'),
    );
    expect(ok.ok).toBe(true);
    expect(helpers.setStatus).toHaveBeenCalledWith(undefined);
    applySubmitResult({ ok: false, formError: 'no fields' }, helpers as never);
    applySubmitResult(
      {
        ok: false,
        fieldErrors: { gstin: 'Invalid' },
        formError: 'Check fields',
      },
      helpers as never,
    );
    expect(helpers.setErrors).toHaveBeenCalled();
    expect(asStatusMessage('x')).toBe('x');
    expect(asStatusMessage(1)).toBeUndefined();
  });
});

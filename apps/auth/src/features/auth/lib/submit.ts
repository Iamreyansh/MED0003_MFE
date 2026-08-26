import type { AuthSubmitResult } from '@medmate/auth-contract';
import type { FormikHelpers } from 'formik';
import { useEffect } from 'react';
import { shakeElement } from '../../../lib/motion';

export function applySubmitResult<T>(
  result: AuthSubmitResult,
  helpers: FormikHelpers<T>,
  fieldRoot?: HTMLElement | null,
): AuthSubmitResult {
  if (result.ok) {
    helpers.setStatus(undefined);
    return result;
  }
  if (result.fieldErrors) {
    helpers.setErrors(result.fieldErrors as never);
  }
  const banner =
    result.formError ??
    (result.retryAfterSeconds
      ? `Too many attempts. Retry in ${result.retryAfterSeconds}s.`
      : undefined);
  helpers.setStatus(banner);
  shakeElement(fieldRoot ?? null);
  return result;
}

export function asStatusMessage(status: unknown): string | undefined {
  return typeof status === 'string' ? status : undefined;
}

export function useHostFormState(
  setErrors: (errors: Record<string, string>) => void,
  setStatus: (status: unknown) => void,
  errors?: Record<string, string>,
  formError?: string,
): void {
  useEffect(() => {
    if (errors) {
      setErrors(errors);
    }
  }, [errors, setErrors]);

  useEffect(() => {
    if (formError) {
      setStatus(formError);
    }
  }, [formError, setStatus]);
}

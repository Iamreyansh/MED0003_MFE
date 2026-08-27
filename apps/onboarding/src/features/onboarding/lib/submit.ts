import type { OnboardingSubmitResult } from '@medmate/onboarding-contract';
import type { FormikHelpers } from 'formik';
import { useEffect } from 'react';
import { focusFirstError } from '../../../lib/focus';

export function applySubmitResult<T>(
  result: OnboardingSubmitResult,
  helpers: FormikHelpers<T>,
  fieldRoot?: HTMLElement | null,
): OnboardingSubmitResult {
  if (result.ok) {
    helpers.setStatus(undefined);
    return result;
  }
  if (result.fieldErrors) {
    helpers.setErrors(result.fieldErrors as never);
    focusFirstError(fieldRoot ?? null, result.fieldErrors);
  }
  const banner =
    result.formError ??
    (result.retryAfterSeconds
      ? `Too many attempts. Retry in ${result.retryAfterSeconds}s.`
      : undefined);
  helpers.setStatus(banner);
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

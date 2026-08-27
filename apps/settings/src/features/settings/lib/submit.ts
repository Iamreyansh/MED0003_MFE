import type { SettingsSubmitResult } from '@medmate/settings-contract';
import type { FormikHelpers } from 'formik';
import { useEffect } from 'react';
import { focusFirstError } from '../../../lib/focus';

export function applySubmitResult<T>(
  result: SettingsSubmitResult,
  helpers: FormikHelpers<T>,
  fieldRoot?: HTMLElement | null,
): SettingsSubmitResult {
  if (result.ok) {
    helpers.setStatus(undefined);
    return result;
  }
  if (result.fieldErrors) {
    helpers.setErrors(result.fieldErrors as never);
    focusFirstError(fieldRoot ?? null, result.fieldErrors);
  }
  helpers.setStatus(result.formError);
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

import { useFormikContext } from 'formik';
import { useHostFormState } from '../../features/settings/lib/submit';

export function HostSync({
  errors,
  formError,
}: {
  errors?: Record<string, string>;
  formError?: string;
}) {
  const { setErrors, setStatus } = useFormikContext();
  useHostFormState(setErrors, setStatus, errors, formError);
  return null;
}

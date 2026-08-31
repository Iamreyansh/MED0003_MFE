import {
  normalizeIdentifier,
  type AuthFeatureData,
} from '@medmate/auth-contract';
import { Button, Form, Stack, TextField } from '@medmate/ui';
import { Formik } from 'formik';
import { useRef } from 'react';
import {
  applySubmitResult,
  asStatusMessage,
} from '../../features/auth/lib/submit';
import { forgotSchema } from '../../lib/schemas';
import { AuthFormError } from '../shared/form-error';
import { HostSync } from '../shared/host-sync';

export function PharmacyForgotScreen({
  feature,
  submitLabel,
  identifierLabel,
  onNavigate,
}: {
  feature: AuthFeatureData;
  submitLabel: string;
  identifierLabel: string;
  onNavigate?: (path: string) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Formik
      initialValues={{
        identifier: feature.initialValues?.identifier ?? '',
      }}
      validationSchema={forgotSchema}
      onSubmit={async (values, helpers) => {
        const result = await feature.onSubmit({
          portalType: 'pharmacy-forgot',
          action: 'request',
          values: {
            identifier: normalizeIdentifier(values.identifier),
          },
        });
        applySubmitResult(result, helpers, formRef.current);
        if (result.ok) {
          helpers.setStatus(
            'If an account exists, we recorded the request. Until email/SMS is live, ask an owner to issue a reset token from Roles.',
          );
        }
      }}
    >
      {(formik) => {
        const submitting = formik.isSubmitting || Boolean(feature.busy);
        return (
          <Form
            ref={formRef}
            className="flex w-full max-w-md flex-col"
            onSubmit={formik.handleSubmit}
            noValidate
          >
            <Stack gap="4">
              <HostSync errors={feature.errors} formError={feature.formError} />
              <AuthFormError
                message={asStatusMessage(formik.status)}
                testId="forgot-error"
              />
              <TextField
                label={identifierLabel}
                name="identifier"
                type="text"
                autoComplete="username"
                value={formik.values.identifier}
                onChange={formik.handleChange}
                error={
                  formik.touched.identifier
                    ? formik.errors.identifier
                    : undefined
                }
                disabled={feature.disabled}
              />
              <Button
                type="submit"
                disabled={submitting || feature.disabled}
                size="lg"
              >
                {submitting ? 'Requesting…' : submitLabel}
              </Button>
              {feature.links?.login && onNavigate ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onNavigate(feature.links!.login!)}
                >
                  Back to sign in
                </Button>
              ) : null}
            </Stack>
          </Form>
        );
      }}
    </Formik>
  );
}

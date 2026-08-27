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
import { pharmacySchema } from '../../lib/schemas';
import { AuthFormError } from '../shared/form-error';
import { HostSync } from '../shared/host-sync';

export function PharmacyLoginScreen({
  feature,
  submitLabel,
  identifierLabel,
  passwordLabel,
  posLoginHref,
  onNavigate,
}: {
  feature: AuthFeatureData;
  submitLabel: string;
  identifierLabel: string;
  passwordLabel: string;
  posLoginHref?: string;
  onNavigate?: (path: string) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Formik
      initialValues={{
        identifier: feature.initialValues?.identifier ?? '',
        password: feature.initialValues?.password ?? '',
      }}
      validationSchema={pharmacySchema}
      onSubmit={async (values, helpers) => {
        const result = await feature.onSubmit({
          portalType: 'pharmacy',
          action: 'login',
          values: {
            identifier: normalizeIdentifier(values.identifier),
            password: values.password,
            pharmacyId: feature.initialValues?.pharmacyId,
          },
        });
        applySubmitResult(result, helpers, formRef.current);
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
                testId="login-error"
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
              <TextField
                label={passwordLabel}
                name="password"
                type="password"
                autoComplete="current-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={
                  formik.touched.password ? formik.errors.password : undefined
                }
                disabled={feature.disabled}
              />
              <Button
                type="submit"
                disabled={submitting || feature.disabled}
                size="lg"
              >
                {submitting ? 'Signing in…' : submitLabel}
              </Button>
              {posLoginHref && onNavigate ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onNavigate(posLoginHref)}
                >
                  Counter PIN sign-in
                </Button>
              ) : null}
              {feature.links?.register && onNavigate ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onNavigate(feature.links!.register!)}
                >
                  Create pharmacy account
                </Button>
              ) : null}
            </Stack>
          </Form>
        );
      }}
    </Formik>
  );
}

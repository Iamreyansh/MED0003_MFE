import type { AuthFeatureData, AuthStep } from '@medmate/auth-contract';
import { Box, Button, Form, Stack, TextField } from '@medmate/ui';
import { Formik } from 'formik';
import { useLayoutEffect, useRef, useState } from 'react';
import {
  applySubmitResult,
  asStatusMessage,
} from '../../features/auth/lib/submit';
import { slideStep } from '../../lib/motion';
import { adminSchema, mfaSchema } from '../../lib/schemas';
import { AuthFormError } from '../shared/form-error';
import { HostSync } from '../shared/host-sync';

export function AdminLoginScreen({
  feature,
  identifierLabel,
  passwordLabel,
  submitLabel,
}: {
  feature: AuthFeatureData;
  identifierLabel: string;
  passwordLabel: string;
  submitLabel: string;
}) {
  const [step, setStep] = useState<AuthStep>(
    feature.initialStep === 'mfa' ? 'mfa' : 'credentials',
  );
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    slideStep(panelRef.current);
  }, [step]);

  if (step === 'mfa') {
    return (
      <Box ref={panelRef}>
        <Formik
          key="mfa"
          initialValues={{ code: '' }}
          validationSchema={mfaSchema}
          onSubmit={async (values, helpers) => {
            const result = await feature.onSubmit({
              portalType: 'admin',
              action: 'verifyMfa',
              values: { code: values.code },
            });
            applySubmitResult(result, helpers, panelRef.current);
          }}
        >
          {(formik) => (
            <Form
              className="flex w-full max-w-md flex-col"
              onSubmit={formik.handleSubmit}
              noValidate
            >
              <Stack gap="4">
                <HostSync
                  errors={feature.errors}
                  formError={feature.formError}
                />
                <AuthFormError message={asStatusMessage(formik.status)} />
                <TextField
                  label="Authenticator code"
                  name="code"
                  autoComplete="one-time-code"
                  value={formik.values.code}
                  onChange={formik.handleChange}
                  error={formik.touched.code ? formik.errors.code : undefined}
                  disabled={feature.disabled}
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={formik.isSubmitting || feature.disabled}
                >
                  {formik.isSubmitting ? 'Verifying…' : 'Verify'}
                </Button>
              </Stack>
            </Form>
          )}
        </Formik>
      </Box>
    );
  }

  return (
    <Box ref={panelRef}>
      <Formik
        key="credentials"
        initialValues={{
          email: feature.initialValues?.email ?? '',
          password: '',
        }}
        validationSchema={adminSchema}
        onSubmit={async (values, helpers) => {
          const result = await feature.onSubmit({
            portalType: 'admin',
            action: 'login',
            values: {
              email: values.email.trim().toLowerCase(),
              password: values.password,
            },
          });
          applySubmitResult(result, helpers, panelRef.current);
          if (result.ok && result.nextStep === 'mfa') {
            setStep('mfa');
          }
        }}
      >
        {(formik) => (
          <Form
            className="flex w-full max-w-md flex-col"
            onSubmit={formik.handleSubmit}
            noValidate
          >
            <Stack gap="4">
              <HostSync errors={feature.errors} formError={feature.formError} />
              <AuthFormError message={asStatusMessage(formik.status)} />
              <TextField
                label={identifierLabel}
                name="email"
                type="email"
                autoComplete="username"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email ? formik.errors.email : undefined}
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
                size="lg"
                disabled={formik.isSubmitting || feature.disabled}
              >
                {formik.isSubmitting ? 'Signing in…' : submitLabel}
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>
    </Box>
  );
}

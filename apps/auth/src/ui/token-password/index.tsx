import type { AuthFeatureData } from '@medmate/auth-contract';
import { Button, Form, Stack, TextField } from '@medmate/ui';
import { Formik } from 'formik';
import { useRef } from 'react';
import {
  applySubmitResult,
  asStatusMessage,
} from '../../features/auth/lib/submit';
import { tokenPasswordSchema } from '../../lib/schemas';
import { AuthFormError } from '../shared/form-error';
import { HostSync } from '../shared/host-sync';

export function TokenPasswordScreen({
  feature,
  portalType,
  tokenLabel,
  passwordLabel,
  submitLabel,
}: {
  feature: AuthFeatureData;
  portalType: 'admin-invite' | 'admin-reset';
  tokenLabel: string;
  passwordLabel: string;
  submitLabel: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const tokenKey = portalType === 'admin-invite' ? 'inviteToken' : 'resetToken';

  return (
    <Formik
      initialValues={{
        token:
          feature.initialValues?.token ??
          feature.initialValues?.[tokenKey] ??
          '',
        password: '',
      }}
      validationSchema={tokenPasswordSchema}
      onSubmit={async (values, helpers) => {
        const result = await feature.onSubmit(
          portalType === 'admin-invite'
            ? {
                portalType: 'admin-invite',
                action: 'complete',
                values: {
                  inviteToken: values.token,
                  password: values.password,
                },
              }
            : {
                portalType: 'admin-reset',
                action: 'complete',
                values: {
                  resetToken: values.token,
                  password: values.password,
                },
              },
        );
        applySubmitResult(result, helpers, formRef.current);
      }}
    >
      {(formik) => (
        <Form
          ref={formRef}
          className="flex w-full max-w-md flex-col"
          onSubmit={formik.handleSubmit}
          noValidate
        >
          <Stack gap="4">
            <HostSync errors={feature.errors} formError={feature.formError} />
            <AuthFormError message={asStatusMessage(formik.status)} />
            <TextField
              label={tokenLabel}
              name="token"
              value={formik.values.token}
              onChange={formik.handleChange}
              error={formik.touched.token ? formik.errors.token : undefined}
              disabled={feature.disabled}
            />
            <TextField
              label={passwordLabel}
              name="password"
              type="password"
              autoComplete="new-password"
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
              {formik.isSubmitting ? 'Saving…' : submitLabel}
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
}

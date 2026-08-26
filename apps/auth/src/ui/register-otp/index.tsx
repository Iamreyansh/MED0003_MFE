import {
  type AuthFeatureData,
  type AuthStepContext,
} from '@medmate/auth-contract';
import { Box, Button, Form, InputOTP, Stack, TextField } from '@medmate/ui';
import { Formik } from 'formik';
import { useLayoutEffect, useRef, useState } from 'react';
import {
  applySubmitResult,
  asStatusMessage,
} from '../../features/auth/lib/submit';
import { slideStep } from '../../lib/motion';
import { emailOtpRequestSchema, otpSchema } from '../../lib/schemas';
import { AuthFormError } from '../shared/form-error';
import { HostSync } from '../shared/host-sync';

export function RegisterOtpScreen({
  feature,
  identifierLabel,
  sendLabel,
}: {
  feature: AuthFeatureData;
  identifierLabel: string;
  sendLabel: string;
}) {
  const [step, setStep] = useState<'email' | 'otp'>(
    feature.initialStep === 'otp' ? 'otp' : 'email',
  );
  const [email, setEmail] = useState(feature.initialValues?.email ?? '');
  const panelRef = useRef<HTMLDivElement>(null);
  const [otpContext, setOtpContext] = useState<AuthStepContext>(
    feature.otpContext ?? {},
  );

  useLayoutEffect(() => {
    slideStep(panelRef.current);
  }, [step]);

  if (step === 'otp') {
    return (
      <Box ref={panelRef}>
        <Formik
          initialValues={{ otp: '' }}
          validationSchema={otpSchema}
          onSubmit={async (values, helpers) => {
            const result = await feature.onSubmit({
              portalType: 'pharmacy-register-otp',
              action: 'verifyOtp',
              values: { email, otp: values.otp },
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
                <InputOTP
                  label="Email OTP"
                  value={formik.values.otp}
                  onChange={(next) => void formik.setFieldValue('otp', next)}
                  disabled={feature.disabled}
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={formik.isSubmitting || feature.disabled}
                >
                  {formik.isSubmitting ? 'Verifying…' : 'Verify email'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    void feature.onSubmit({
                      portalType: 'pharmacy-register-otp',
                      action: 'resendOtp',
                      values: { email },
                    });
                  }}
                >
                  Resend OTP
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
        initialValues={{ email }}
        validationSchema={emailOtpRequestSchema}
        onSubmit={async (values, helpers) => {
          const nextEmail = values.email.trim().toLowerCase();
          const result = await feature.onSubmit({
            portalType: 'pharmacy-register-otp',
            action: 'sendOtp',
            values: { email: nextEmail },
          });
          applySubmitResult(result, helpers, panelRef.current);
          if (result.ok) {
            setEmail(nextEmail);
            setOtpContext(result.context ?? otpContext);
            setStep('otp');
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
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email ? formik.errors.email : undefined}
                disabled={feature.disabled}
              />
              <Button
                type="submit"
                size="lg"
                disabled={formik.isSubmitting || feature.disabled}
              >
                {formik.isSubmitting ? 'Sending…' : sendLabel}
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>
    </Box>
  );
}

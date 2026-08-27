import type { OnboardingFeatureData } from '@medmate/onboarding-contract';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Form,
  InputOTP,
  Stack,
  Text,
} from '@medmate/ui';
import { Formik } from 'formik';
import { Lock, Mail } from 'lucide-react';
import { useRef, useState } from 'react';
import {
  applySubmitResult,
  asStatusMessage,
} from '../../features/onboarding/lib/submit';
import { otpSchema } from '../../lib/schemas';
import { FormBanner } from '../shared/form-error';
import { HostSync } from '../shared/host-sync';

export function VerifyScreen({ feature }: { feature: OnboardingFeatureData }) {
  const formRef = useRef<HTMLFormElement>(null);
  const email = feature.initialValues?.email ?? '';
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  return (
    <Formik
      initialValues={{ otp: '' }}
      validationSchema={otpSchema}
      onSubmit={async (values, helpers) => {
        const result = await feature.onSubmit({
          screen: 'verify',
          action: 'verifyOtp',
          values: { email, otp: values.otp },
        });
        applySubmitResult(result, helpers, formRef.current);
        if (!result.ok && result.code === 'INVALID_OTP') {
          formRef.current
            ?.querySelector<HTMLInputElement>(
              'input[autocomplete="one-time-code"]',
            )
            ?.focus();
        }
      }}
    >
      {(formik) => (
        <Form
          ref={formRef}
          className="flex w-full max-w-md mx-auto flex-col justify-center"
          onSubmit={formik.handleSubmit}
          noValidate
        >
          <Stack gap="4">
            <HostSync errors={feature.errors} formError={feature.formError} />
            <FormBanner
              message={asStatusMessage(formik.status)}
              testId="verify-error"
            />
            <Card className="p-5">
              <Flex align="start" gap="3" className="mb-4">
                <Box className="flex size-10 shrink-0 items-center justify-center rounded-mm bg-mm-primary-soft text-mm-primary">
                  <Mail className="size-5" aria-hidden />
                </Box>
                <Box className="min-w-0">
                  {email ? (
                    <>
                      <Text size="sm" tone="muted">
                        OTP sent to the owner mailbox. Refresh keeps this page
                        so you can resend.
                      </Text>
                      <Badge className="mt-2 max-w-full truncate">
                        {email}
                      </Badge>
                    </>
                  ) : (
                    <Text tone="muted">
                      Enter the OTP from your registration email, then resend if
                      needed.
                    </Text>
                  )}
                </Box>
              </Flex>
              <InputOTP
                label="Email OTP"
                value={formik.values.otp}
                onChange={(next) => void formik.setFieldValue('otp', next)}
                disabled={feature.disabled}
              />
              {formik.touched.otp && formik.errors.otp ? (
                <Text tone="error" size="sm" role="alert" className="mt-2">
                  {formik.errors.otp}
                </Text>
              ) : null}
              <Flex align="center" gap="2" className="mt-4">
                <Lock className="size-4 text-mm-muted" aria-hidden />
                <Text size="sm" tone="muted">
                  The code expires. Resend if the mailbox is slow.
                </Text>
              </Flex>
            </Card>
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
              disabled={resending || cooldown > 0 || feature.disabled || !email}
              onClick={() => {
                void (async () => {
                  setResending(true);
                  const result = await feature.onSubmit({
                    screen: 'verify',
                    action: 'resendOtp',
                    values: { email },
                  });
                  setResending(false);
                  if (!result.ok) {
                    formik.setStatus(
                      result.formError ??
                        (result.retryAfterSeconds
                          ? `Wait ${result.retryAfterSeconds}s before resending.`
                          : 'Unable to resend OTP.'),
                    );
                    if (result.retryAfterSeconds) {
                      setCooldown(result.retryAfterSeconds);
                      window.setTimeout(
                        () => setCooldown(0),
                        result.retryAfterSeconds * 1000,
                      );
                    }
                    return;
                  }
                  const wait = result.retryAfterSeconds ?? 60;
                  setCooldown(wait);
                  window.setTimeout(() => setCooldown(0), wait * 1000);
                  formik.setStatus(undefined);
                })();
              }}
            >
              {cooldown > 0
                ? `Resend in ${cooldown}s`
                : resending
                  ? 'Sending…'
                  : 'Resend OTP'}
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
}

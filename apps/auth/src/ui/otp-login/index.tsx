import {
  normalizeIdentifier,
  type AuthFeatureData,
  type AuthPortalType,
  type AuthStepContext,
} from '@medmate/auth-contract';
import {
  Box,
  Button,
  Form,
  InputOTP,
  Stack,
  Text,
  TextField,
} from '@medmate/ui';
import { Formik } from 'formik';
import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react';
import {
  applySubmitResult,
  asStatusMessage,
} from '../../features/auth/lib/submit';
import { slideStep } from '../../lib/motion';
import { otpSchema, phoneSchema } from '../../lib/schemas';
import { AuthFormError } from '../shared/form-error';
import { HostSync } from '../shared/host-sync';

export function OtpLoginScreen({
  feature,
  portalType,
  identifierLabel,
  sendLabel,
}: {
  feature: AuthFeatureData;
  portalType: 'customer-otp' | 'rider-otp';
  identifierLabel: string;
  sendLabel: string;
}) {
  const [step, setStep] = useState<'phone' | 'otp'>(
    feature.initialStep === 'otp' ? 'otp' : 'phone',
  );
  const [phone, setPhone] = useState(feature.initialValues?.phone ?? '');
  const [otpContext, setOtpContext] = useState<AuthStepContext>(
    feature.otpContext ?? {},
  );
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    slideStep(panelRef.current);
  }, [step]);

  if (step === 'otp') {
    return (
      <Panel panelRef={panelRef}>
        <OtpStep
          feature={feature}
          portalType={portalType}
          phone={phone}
          otpContext={otpContext}
          onResent={setOtpContext}
        />
      </Panel>
    );
  }

  return (
    <Panel panelRef={panelRef}>
      <Formik
        initialValues={{ phone }}
        validationSchema={phoneSchema}
        onSubmit={async (values, helpers) => {
          const nextPhone = normalizeIdentifier(values.phone);
          const result = await feature.onSubmit({
            portalType,
            action: 'sendOtp',
            values: { phone: nextPhone },
          });
          applySubmitResult(result, helpers, panelRef.current);
          if (result.ok) {
            setPhone(nextPhone);
            setOtpContext(result.context ?? {});
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
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone ? formik.errors.phone : undefined}
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
    </Panel>
  );
}

function Panel({
  panelRef,
  children,
}: {
  panelRef: Ref<HTMLElement>;
  children: ReactNode;
}) {
  return <Box ref={panelRef}>{children}</Box>;
}

function OtpStep({
  feature,
  portalType,
  phone,
  otpContext,
  onResent,
}: {
  feature: AuthFeatureData;
  portalType: Extract<AuthPortalType, 'customer-otp' | 'rider-otp'>;
  phone: string;
  otpContext: AuthStepContext;
  onResent: (context: AuthStepContext) => void;
}) {
  const [now] = useState(() => Date.now());
  const resendAt = otpContext.resendAllowedAt
    ? Date.parse(otpContext.resendAllowedAt)
    : 0;
  const resendWait = Number.isFinite(resendAt)
    ? Math.max(0, Math.ceil((resendAt - now) / 1000))
    : 0;

  return (
    <Formik
      initialValues={{ otp: '' }}
      validationSchema={otpSchema}
      onSubmit={async (values, helpers) => {
        const result = await feature.onSubmit({
          portalType,
          action: 'verifyOtp',
          values: {
            phone,
            otp: values.otp,
            sessionId: otpContext.sessionId ?? '',
          },
        });
        applySubmitResult(result, helpers);
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
            <InputOTP
              label="OTP"
              value={formik.values.otp}
              onChange={(next) => void formik.setFieldValue('otp', next)}
              disabled={feature.disabled}
            />
            {formik.touched.otp && formik.errors.otp ? (
              <Text tone="error" role="alert">
                {formik.errors.otp}
              </Text>
            ) : null}
            <Button
              type="submit"
              size="lg"
              disabled={formik.isSubmitting || feature.disabled}
            >
              {formik.isSubmitting ? 'Verifying…' : 'Verify OTP'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={resendWait > 0 || feature.disabled}
              onClick={() => {
                void feature
                  .onSubmit({
                    portalType,
                    action: 'resendOtp',
                    values: { phone },
                  })
                  .then((result) => {
                    if (result.ok) {
                      onResent(result.context ?? otpContext);
                    }
                  });
              }}
            >
              {resendWait > 0 ? `Resend in ${resendWait}s` : 'Resend OTP'}
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
}

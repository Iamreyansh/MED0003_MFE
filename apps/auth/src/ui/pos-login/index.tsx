import type { AuthFeatureData } from '@medmate/auth-contract';
import { Button, Form, Stack, Text, TextField } from '@medmate/ui';
import { Formik, type FormikProps } from 'formik';
import { useEffect, useRef, type Ref } from 'react';
import {
  applySubmitResult,
  asStatusMessage,
} from '../../features/auth/lib/submit';
import { posSchema } from '../../lib/schemas';
import { AuthFormError } from '../shared/form-error';
import { HostSync } from '../shared/host-sync';
import { PinPad } from './pin-pad';

type Values = { pharmacyId: string; staffId: string; pin: string };

export function PosLoginScreen({
  feature,
  submitLabel,
}: {
  feature: AuthFeatureData;
  submitLabel: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Formik
      initialValues={{
        pharmacyId: feature.initialValues?.pharmacyId ?? '',
        staffId: feature.initialValues?.staffId ?? '',
        pin: '',
      }}
      validationSchema={posSchema}
      onSubmit={async (values, helpers) => {
        const result = await feature.onSubmit({
          portalType: 'pos',
          action: 'login',
          values: {
            pharmacyId: values.pharmacyId,
            staffId: values.staffId,
            pin: values.pin,
          },
        });
        applySubmitResult(result, helpers, formRef.current);
        if (!result.ok && result.code === 'INVALID_PIN') {
          await helpers.setFieldValue('pin', '');
        }
      }}
    >
      {(formik) => (
        <PosFormBody
          formik={formik}
          feature={feature}
          submitLabel={submitLabel}
          formRef={formRef}
        />
      )}
    </Formik>
  );
}

function PosFormBody({
  formik,
  feature,
  submitLabel,
  formRef,
}: {
  formik: FormikProps<Values>;
  feature: AuthFeatureData;
  submitLabel: string;
  formRef: Ref<HTMLFormElement>;
}) {
  const pin = formik.values.pin;
  const setFieldValue = formik.setFieldValue;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement) {
        return;
      }
      if (event.key >= '0' && event.key <= '9') {
        void setFieldValue('pin', (pin + event.key).slice(0, 4));
      }
      if (event.key === 'Backspace') {
        void setFieldValue('pin', pin.slice(0, -1));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pin, setFieldValue]);

  function pushDigit(digit: string) {
    if (digit === '⌫') {
      void setFieldValue('pin', pin.slice(0, -1));
      return;
    }
    if (!digit) {
      return;
    }
    void setFieldValue('pin', pin.length < 4 ? pin + digit : pin);
  }

  const submitting = formik.isSubmitting || Boolean(feature.busy);
  const fieldError =
    (formik.touched.pharmacyId && formik.errors.pharmacyId) ||
    (formik.touched.staffId && formik.errors.staffId) ||
    (formik.touched.pin && formik.errors.pin);

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
          testId="pos-login-error"
        />
        {fieldError ? (
          <Text tone="error" role="alert">
            {fieldError}
          </Text>
        ) : null}
        <TextField
          label="Pharmacy ID"
          name="pharmacyId"
          type="text"
          autoComplete="off"
          value={formik.values.pharmacyId}
          onChange={(event) =>
            void formik.setFieldValue('pharmacyId', event.target.value.trim())
          }
          disabled={feature.disabled}
        />
        <TextField
          label="Staff ID"
          name="staffId"
          type="text"
          autoComplete="off"
          value={formik.values.staffId}
          onChange={(event) =>
            void formik.setFieldValue('staffId', event.target.value.trim())
          }
          disabled={feature.disabled}
        />
        <PinPad pin={pin} onDigit={pushDigit} />
        <Button
          type="submit"
          size="lg"
          disabled={submitting || feature.disabled || pin.length !== 4}
        >
          {submitting ? 'Signing in…' : submitLabel}
        </Button>
      </Stack>
    </Form>
  );
}

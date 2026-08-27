import type { OnboardingFeatureData } from '@medmate/onboarding-contract';
import { normalizeEmail, normalizePhone } from '@medmate/onboarding-contract';
import {
  Badge,
  Button,
  Flex,
  Form,
  Grid,
  Stack,
  Text,
  TextField,
} from '@medmate/ui';
import { Formik } from 'formik';
import { ArrowRight, Building2, MapPin, ShieldCheck, User } from 'lucide-react';
import { useRef } from 'react';
import {
  applySubmitResult,
  asStatusMessage,
} from '../../features/onboarding/lib/submit';
import { REGISTER_SECTIONS } from '../../lib/copy';
import { registerSchema } from '../../lib/schemas';
import { INDIAN_STATES } from '../../lib/states';
import { FormBanner } from '../shared/form-error';
import { HostSync } from '../shared/host-sync';
import { SectionBlock } from '../shared/section-block';
import { SelectField } from '../shared/select-field';

export function RegisterScreen({
  feature,
  onNavigate,
}: {
  feature: OnboardingFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Formik
      initialValues={{
        owner_name: '',
        business_name: '',
        phone: '',
        email: '',
        password: '',
        flat: '',
        area: '',
        city: '',
        state: 'Karnataka',
        pincode: '',
        gstin: '',
        drug_licence_number: '',
        fssai_number: '',
        pan_number: '',
      }}
      validationSchema={registerSchema}
      onSubmit={async (values, helpers) => {
        const result = await feature.onSubmit({
          screen: 'register',
          action: 'submit',
          values: {
            owner_name: values.owner_name.trim(),
            business_name: values.business_name.trim(),
            phone: normalizePhone(values.phone),
            email: normalizeEmail(values.email),
            password: values.password,
            business_type: 'PHARMACY',
            address: {
              flat: values.flat.trim(),
              area: values.area.trim(),
              city: values.city.trim(),
              state: values.state,
              pincode: values.pincode.trim(),
            },
            gstin: values.gstin.trim().toUpperCase(),
            drug_licence_number: values.drug_licence_number.trim(),
            fssai_number: values.fssai_number.trim() || undefined,
            pan_number: values.pan_number.trim().toUpperCase(),
          },
        });
        applySubmitResult(result, helpers, formRef.current);
      }}
    >
      {(formik) => {
        const submitting = formik.isSubmitting || Boolean(feature.busy);
        const field = (name: keyof typeof formik.values) =>
          formik.touched[name] ? formik.errors[name] : undefined;
        return (
          <Form
            ref={formRef}
            className="flex w-full flex-col"
            onSubmit={formik.handleSubmit}
            noValidate
          >
            <Stack gap="4">
              <HostSync errors={feature.errors} formError={feature.formError} />
              <FormBanner
                message={asStatusMessage(formik.status)}
                testId="register-error"
              />
              <SectionBlock
                icon={User}
                title={REGISTER_SECTIONS.owner.title}
                hint={REGISTER_SECTIONS.owner.hint}
                step={1}
              >
                <Grid cols="1" gap="3" className="sm:grid-cols-2">
                  <TextField
                    label="Owner name"
                    name="owner_name"
                    autoComplete="name"
                    value={formik.values.owner_name}
                    onChange={formik.handleChange}
                    error={field('owner_name')}
                    disabled={feature.disabled}
                  />
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={field('email')}
                    disabled={feature.disabled}
                  />
                  <TextField
                    label="Mobile"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    error={field('phone')}
                    disabled={feature.disabled}
                  />
                  <TextField
                    label="Password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    error={field('password')}
                    disabled={feature.disabled}
                  />
                </Grid>
              </SectionBlock>
              <SectionBlock
                icon={Building2}
                title={REGISTER_SECTIONS.shop.title}
                hint={REGISTER_SECTIONS.shop.hint}
                step={2}
              >
                <TextField
                  label="Business name"
                  name="business_name"
                  value={formik.values.business_name}
                  onChange={formik.handleChange}
                  error={field('business_name')}
                  disabled={feature.disabled}
                />
                <Flex align="start" gap="2" className="mt-3">
                  <Badge tone="primary">Free plan</Badge>
                  <Text size="sm" tone="muted">
                    Plan starts as Free. Core assigns it — this form does not
                    choose a paid plan.
                  </Text>
                </Flex>
              </SectionBlock>
              <SectionBlock
                icon={MapPin}
                title={REGISTER_SECTIONS.address.title}
                hint={REGISTER_SECTIONS.address.hint}
                step={3}
              >
                <Grid
                  cols="1"
                  gap="3"
                  className="sm:grid-cols-2 xl:grid-cols-3"
                >
                  <TextField
                    label="Flat / street"
                    name="flat"
                    value={formik.values.flat}
                    onChange={formik.handleChange}
                    error={field('flat')}
                    disabled={feature.disabled}
                  />
                  <TextField
                    label="Area"
                    name="area"
                    value={formik.values.area}
                    onChange={formik.handleChange}
                    error={field('area')}
                    disabled={feature.disabled}
                  />
                  <TextField
                    label="City"
                    name="city"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    error={field('city')}
                    disabled={feature.disabled}
                  />
                  <SelectField
                    label="State"
                    name="state"
                    value={formik.values.state}
                    onChange={formik.handleChange}
                    error={field('state')}
                    disabled={feature.disabled}
                  >
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </SelectField>
                  <TextField
                    label="Pincode"
                    name="pincode"
                    inputMode="numeric"
                    value={formik.values.pincode}
                    onChange={formik.handleChange}
                    error={field('pincode')}
                    disabled={feature.disabled}
                  />
                </Grid>
              </SectionBlock>
              <SectionBlock
                icon={ShieldCheck}
                title={REGISTER_SECTIONS.licences.title}
                hint={REGISTER_SECTIONS.licences.hint}
                step={4}
              >
                <Grid cols="1" gap="3" className="sm:grid-cols-2">
                  <TextField
                    label="GSTIN"
                    name="gstin"
                    value={formik.values.gstin}
                    onChange={formik.handleChange}
                    error={field('gstin')}
                    disabled={feature.disabled}
                  />
                  <TextField
                    label="PAN"
                    name="pan_number"
                    value={formik.values.pan_number}
                    onChange={formik.handleChange}
                    error={field('pan_number')}
                    disabled={feature.disabled}
                  />
                  <TextField
                    label="Drug licence number"
                    name="drug_licence_number"
                    value={formik.values.drug_licence_number}
                    onChange={formik.handleChange}
                    error={field('drug_licence_number')}
                    disabled={feature.disabled}
                  />
                  <TextField
                    label="FSSAI number (optional)"
                    name="fssai_number"
                    value={formik.values.fssai_number}
                    onChange={formik.handleChange}
                    error={field('fssai_number')}
                    disabled={feature.disabled}
                  />
                </Grid>
              </SectionBlock>
              <BoxCta
                submitting={submitting}
                disabled={feature.disabled}
                loginHref={feature.links?.login}
                onNavigate={onNavigate}
              />
            </Stack>
          </Form>
        );
      }}
    </Formik>
  );
}

function BoxCta({
  submitting,
  disabled,
  loginHref,
  onNavigate,
}: {
  submitting: boolean;
  disabled?: boolean;
  loginHref?: string;
  onNavigate?: (path: string) => void;
}) {
  return (
    <Flex
      align="center"
      justify="between"
      gap="3"
      wrap
      className="rounded-mm border border-mm-border bg-mm-surface p-4"
    >
      <Text size="sm" tone="muted" className="max-w-md">
        About three minutes. You will verify email next, then upload KYC.
      </Text>
      <Flex align="center" gap="2" wrap>
        {loginHref && onNavigate ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => onNavigate(loginHref)}
          >
            Already have an account? Sign in
          </Button>
        ) : null}
        <Button type="submit" size="lg" disabled={submitting || disabled}>
          {submitting ? 'Creating account…' : 'Create Free account'}
          {submitting ? null : (
            <ArrowRight className="ml-2 size-4" aria-hidden />
          )}
        </Button>
      </Flex>
    </Flex>
  );
}

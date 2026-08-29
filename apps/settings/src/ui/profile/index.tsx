import type {
  BankSummary,
  CompletenessPayload,
  ProfilePayload,
  SettingsFeatureData,
  TaxPatchValues,
} from '@medmate/settings-contract';
import { normalizeEmail, normalizePhone } from '@medmate/settings-contract';
import {
  Alert,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  InputOTP,
  Stack,
  StatusMessage,
  Text,
  TextField,
  cn,
} from '@medmate/ui';
import { Formik } from 'formik';
import {
  Clock,
  Landmark,
  MapPin,
  Phone,
  Receipt,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  applySubmitResult,
  asStatusMessage,
} from '../../features/settings/lib/submit';
import { KYC_PENDING_STATUSES, SAVE_COPY } from '../../lib/copy';
import { boolOrFalse, textOrEmpty } from '../../lib/focus';
import {
  bankSchema,
  profileSchema,
  taxSchema,
  verifySchema,
} from '../../lib/schemas';
import { INDIAN_STATES } from '../../lib/states';
import { CheckboxField } from '../shared/checkbox-field';
import { DirtyLeaveGuard } from '../shared/dirty-leave';
import { FormBanner, SaveNote } from '../shared/form-error';
import { HostSync } from '../shared/host-sync';
import { SectionBlock } from '../shared/section-block';
import { SelectField } from '../shared/select-field';
import { CompletenessCard } from './completeness';
import {
  HoursFields,
  emptyHours,
  hoursFromPayload,
  type HoursValue,
} from './hours-fields';
import { LogoField } from './logo-field';
import { SectionNav } from './section-nav';

type ProfileFormValues = {
  business_name: string;
  tagline: string;
  logo_url: string;
  phone: string;
  email: string;
  flat: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
};

type TaxFormValues = TaxPatchValues & {
  gstin: string;
  pan_number: string;
  drug_licence_number: string;
  fssai_number: string;
  registered_pharmacist_name: string;
  is_gst_registered: boolean;
  e_invoicing_enabled: boolean;
  tds_applicable: boolean;
  tcs_applicable: boolean;
};

function profileValues(profile: ProfilePayload | null): ProfileFormValues {
  const address = profile?.address;
  return {
    business_name: textOrEmpty(profile?.business_name),
    tagline: textOrEmpty(profile?.tagline),
    logo_url: textOrEmpty(profile?.logo_url),
    phone: textOrEmpty(profile?.phone),
    email: textOrEmpty(profile?.email),
    flat: textOrEmpty(address?.flat),
    area: textOrEmpty(address?.area),
    city: textOrEmpty(address?.city),
    state: textOrEmpty(address?.state) || 'Karnataka',
    pincode: textOrEmpty(address?.pincode),
  };
}

function taxValues(profile: ProfilePayload | null): TaxFormValues {
  const tax = profile?.tax;
  return {
    gstin: textOrEmpty(tax?.gstin),
    pan_number: textOrEmpty(tax?.pan_number),
    drug_licence_number: textOrEmpty(tax?.drug_licence_number),
    fssai_number: textOrEmpty(tax?.fssai_number),
    registered_pharmacist_name: textOrEmpty(tax?.registered_pharmacist_name),
    is_gst_registered: boolOrFalse(tax?.is_gst_registered),
    e_invoicing_enabled: boolOrFalse(tax?.e_invoicing_enabled),
    tds_applicable: boolOrFalse(tax?.tds_applicable),
    tcs_applicable: boolOrFalse(tax?.tcs_applicable),
  };
}

function PendingChips({ fields }: { fields: string[] }) {
  if (fields.length === 0) {
    return null;
  }
  return (
    <Flex gap="2" wrap className="mb-3">
      {fields.map((field) => (
        <Badge key={field} tone="primary">
          {field.replaceAll('_', ' ')} pending
        </Badge>
      ))}
    </Flex>
  );
}

function ProfileSkeleton() {
  return (
    <Stack gap="4" data-testid="profile-skeleton">
      <Text>Loading profile</Text>
      <Box className="h-28 rounded-mm border border-mm-border bg-mm-bg" />
      <Box className="h-40 rounded-mm border border-mm-border bg-mm-bg" />
      <Box className="h-40 rounded-mm border border-mm-border bg-mm-bg" />
    </Stack>
  );
}

export function ProfileScreen({
  feature,
  onNavigate,
}: {
  feature: SettingsFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const canWrite = Boolean(feature.canWrite);
  const readOnly = !canWrite || Boolean(feature.disabled);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [completeness, setCompleteness] = useState<CompletenessPayload | null>(
    null,
  );
  const [completenessNote, setCompletenessNote] = useState<
    string | undefined
  >();
  const [bank, setBank] = useState<BankSummary | null>(null);
  const [bankHidden, setBankHidden] = useState(!canWrite);
  const [hours, setHours] = useState<HoursValue[]>(emptyHours());
  const [pendingApproval, setPendingApproval] = useState<string[]>([]);
  const [pendingVerification, setPendingVerification] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);
  const [profileNote, setProfileNote] = useState<string | undefined>();
  const [taxNote, setTaxNote] = useState<string | undefined>();
  const [bankNote, setBankNote] = useState<string | undefined>();
  const [verifyNote, setVerifyNote] = useState<string | undefined>();
  const [logoBusy, setLogoBusy] = useState(false);
  const profileFormRef = useRef<HTMLFormElement>(null);
  const taxFormRef = useRef<HTMLFormElement>(null);
  const bankFormRef = useRef<HTMLFormElement>(null);
  const verifyFormRef = useRef<HTMLFormElement>(null);

  const onSubmit = feature.onSubmit;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const result = await onSubmit({
        screen: 'profile',
        action: 'load',
      });
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        setLoadError(result.formError ?? 'Unable to load profile.');
        setLoading(false);
        return;
      }
      setProfile(result.profile ?? null);
      setHours(hoursFromPayload(result.profile?.operating_hours));
      const complete = await onSubmit({
        screen: 'profile',
        action: 'loadCompleteness',
      });
      if (cancelled) {
        return;
      }
      if (complete.ok) {
        setCompleteness(complete.completeness ?? null);
      } else {
        setCompletenessNote(complete.formError);
      }
      if (canWrite) {
        const bankResult = await onSubmit({
          screen: 'profile',
          action: 'loadBank',
        });
        if (cancelled) {
          return;
        }
        if (bankResult.ok) {
          setBank(bankResult.bank ?? null);
          setBankHidden(false);
        } else if (bankResult.code === 'FORBIDDEN') {
          setBankHidden(true);
        }
      } else {
        setBankHidden(true);
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [canWrite, onSubmit]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (loadError) {
    return <StatusMessage tone="error">{loadError}</StatusMessage>;
  }

  const status = profile?.status ?? feature.pharmacyStatus ?? '';
  const showKycCallout = KYC_PENDING_STATUSES.has(status);
  const hiddenNav = [
    ...(bankHidden ? ['section-bank'] : []),
    ...(!canWrite ? ['section-verify'] : []),
  ];

  function markDirty() {
    setDirty(true);
    setProfileNote(undefined);
  }

  return (
    <Grid cols="1" gap="6" className="lg:grid-cols-[13rem_minmax(0,1fr)]">
      <SectionNav hiddenIds={hiddenNav} />
      <Stack gap="4">
        <DirtyLeaveGuard dirty={dirty} onNavigate={onNavigate} />
        {showKycCallout ? (
          <Alert tone="info" data-testid="kyc-checklist">
            <Flex align="center" justify="between" gap="3" wrap>
              <Text>KYC documents are still pending.</Text>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onNavigate?.('/onboarding/kyc')}
              >
                Open KYC pack
              </Button>
            </Flex>
          </Alert>
        ) : null}
        <CompletenessCard
          completeness={completeness}
          fallbackPct={profile?.profile_completeness_pct ?? 0}
          note={completenessNote}
        />
        <Formik
          enableReinitialize
          initialValues={profileValues(profile)}
          validationSchema={profileSchema}
          onSubmit={async (values, helpers) => {
            const result = await feature.onSubmit({
              screen: 'profile',
              action: 'save',
              values: {
                business_name: values.business_name.trim(),
                tagline: values.tagline.trim(),
                logo_url: values.logo_url.trim(),
                phone: values.phone ? normalizePhone(values.phone) : '',
                email: values.email ? normalizeEmail(values.email) : '',
                address: {
                  flat: values.flat.trim(),
                  area: values.area.trim(),
                  city: values.city.trim(),
                  state: values.state,
                  pincode: values.pincode.trim(),
                },
                operating_hours: hours.map((row) => ({
                  day_of_week: row.day_of_week,
                  open_time: row.is_closed ? null : row.open_time,
                  close_time: row.is_closed ? null : row.close_time,
                  is_closed: row.is_closed,
                })),
              },
            });
            applySubmitResult(result, helpers, profileFormRef.current);
            if (result.ok) {
              setDirty(false);
              setProfileNote(SAVE_COPY.profile);
              setPendingApproval(result.save?.pending_approval_fields ?? []);
              setPendingVerification(
                result.save?.pending_verification_fields ?? [],
              );
              const refresh = await feature.onSubmit({
                screen: 'profile',
                action: 'load',
              });
              if (refresh.ok) {
                setProfile(refresh.profile ?? null);
                setHours(hoursFromPayload(refresh.profile?.operating_hours));
              }
            }
          }}
        >
          {(formik) => {
            const field = (name: keyof ProfileFormValues) =>
              formik.touched[name] ? formik.errors[name] : undefined;
            return (
              <form
                ref={profileFormRef}
                className="flex w-full flex-col gap-4"
                onSubmit={formik.handleSubmit}
                noValidate
              >
                <HostSync
                  errors={feature.errors}
                  formError={feature.formError}
                />
                <FormBanner
                  message={asStatusMessage(formik.status)}
                  testId="profile-error"
                />
                <PendingChips fields={pendingApproval} />
                <PendingChips fields={pendingVerification} />
                <SectionBlock
                  id="section-identity"
                  title="Shop identity"
                  hint="Shop name and a photo of your board. A web link is optional."
                  icon={Store}
                >
                  <Grid cols="1" gap="3" className="sm:grid-cols-2">
                    <TextField
                      label="Business name"
                      name="business_name"
                      autoComplete="organization"
                      value={formik.values.business_name}
                      onChange={(event) => {
                        markDirty();
                        formik.handleChange(event);
                      }}
                      error={field('business_name')}
                      disabled={readOnly}
                    />
                    <TextField
                      label="Tagline"
                      name="tagline"
                      value={formik.values.tagline}
                      onChange={(event) => {
                        markDirty();
                        formik.handleChange(event);
                      }}
                      error={field('tagline')}
                      disabled={readOnly}
                    />
                    <LogoField
                      url={formik.values.logo_url}
                      error={formik.errors.logo_url}
                      disabled={readOnly}
                      busy={logoBusy}
                      onUrlChange={(value) => {
                        markDirty();
                        void formik.setFieldValue('logo_url', value);
                        formik.setFieldError('logo_url', undefined);
                      }}
                      onFile={(file) => {
                        void (async () => {
                          const previous = formik.values.logo_url;
                          const preview = URL.createObjectURL(file);
                          await formik.setFieldValue('logo_url', preview);
                          setLogoBusy(true);
                          try {
                            const result = await feature.onSubmit({
                              screen: 'profile',
                              action: 'uploadLogo',
                              values: { file },
                            });
                            URL.revokeObjectURL(preview);
                            if (result.ok) {
                              const next = result.profile?.logo_url ?? '';
                              await formik.setFieldValue('logo_url', next);
                              formik.setFieldError('logo_url', undefined);
                              setProfileNote(SAVE_COPY.logo);
                              const complete = await feature.onSubmit({
                                screen: 'profile',
                                action: 'loadCompleteness',
                              });
                              if (complete.ok) {
                                setCompleteness(complete.completeness ?? null);
                                setCompletenessNote(undefined);
                              }
                              return;
                            }
                            await formik.setFieldValue('logo_url', previous);
                            applySubmitResult(
                              result,
                              formik,
                              profileFormRef.current,
                            );
                            void formik.setFieldTouched(
                              'logo_url',
                              true,
                              false,
                            );
                          } finally {
                            setLogoBusy(false);
                          }
                        })();
                      }}
                    />
                  </Grid>
                </SectionBlock>
                <SectionBlock
                  id="section-contact"
                  title="Contact"
                  hint="Phone and email changes may require OTP verification."
                  icon={Phone}
                >
                  <Grid cols="1" gap="3" className="sm:grid-cols-2">
                    <TextField
                      label="Phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formik.values.phone}
                      onChange={(event) => {
                        markDirty();
                        formik.handleChange(event);
                      }}
                      error={field('phone')}
                      disabled={readOnly}
                    />
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formik.values.email}
                      onChange={(event) => {
                        markDirty();
                        formik.handleChange(event);
                      }}
                      error={field('email')}
                      disabled={readOnly}
                    />
                  </Grid>
                </SectionBlock>
                <SectionBlock
                  id="section-address"
                  title="Address"
                  hint="Registered shop address in India."
                  icon={MapPin}
                >
                  <Grid cols="1" gap="3" className="sm:grid-cols-2">
                    <TextField
                      label="Flat / street"
                      name="flat"
                      autoComplete="address-line1"
                      value={formik.values.flat}
                      onChange={(event) => {
                        markDirty();
                        formik.handleChange(event);
                      }}
                      error={field('flat')}
                      disabled={readOnly}
                    />
                    <TextField
                      label="Area"
                      name="area"
                      autoComplete="address-line2"
                      value={formik.values.area}
                      onChange={(event) => {
                        markDirty();
                        formik.handleChange(event);
                      }}
                      error={field('area')}
                      disabled={readOnly}
                    />
                    <TextField
                      label="City"
                      name="city"
                      autoComplete="address-level2"
                      value={formik.values.city}
                      onChange={(event) => {
                        markDirty();
                        formik.handleChange(event);
                      }}
                      error={field('city')}
                      disabled={readOnly}
                    />
                    <SelectField
                      label="State"
                      name="state"
                      autoComplete="address-level1"
                      value={formik.values.state}
                      disabled={readOnly}
                      error={field('state')}
                      onChange={(event) => {
                        markDirty();
                        formik.handleChange(event);
                      }}
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
                      autoComplete="postal-code"
                      value={formik.values.pincode}
                      onChange={(event) => {
                        markDirty();
                        formik.handleChange(event);
                      }}
                      error={field('pincode')}
                      disabled={readOnly}
                    />
                  </Grid>
                </SectionBlock>
                <SectionBlock
                  id="section-hours"
                  title="Operating hours"
                  hint="Weekly schedule in IST. Closed days keep their last times."
                  icon={Clock}
                >
                  <HoursFields
                    values={hours}
                    disabled={readOnly}
                    onChange={(next) => {
                      markDirty();
                      setHours(next);
                    }}
                  />
                </SectionBlock>
                {canWrite ? (
                  <Flex
                    align="center"
                    justify="end"
                    gap="3"
                    wrap
                    className={cn(
                      'rounded-mm border border-mm-border bg-mm-surface px-4 py-3 shadow-sm',
                      dirty ? 'sticky bottom-0 z-10' : undefined,
                    )}
                  >
                    <SaveNote message={profileNote} />
                    <Button
                      type="submit"
                      disabled={formik.isSubmitting || feature.busy}
                    >
                      Save profile
                    </Button>
                  </Flex>
                ) : (
                  <StatusMessage>
                    Staff can view this profile. Only the owner can save
                    changes.
                  </StatusMessage>
                )}
              </form>
            );
          }}
        </Formik>
        <Formik
          enableReinitialize
          initialValues={taxValues(profile)}
          validationSchema={taxSchema}
          onSubmit={async (values, helpers) => {
            const result = await feature.onSubmit({
              screen: 'profile',
              action: 'saveTax',
              values: {
                gstin: values.gstin.trim().toUpperCase(),
                pan_number: values.pan_number.trim().toUpperCase(),
                drug_licence_number: values.drug_licence_number.trim(),
                fssai_number: values.fssai_number.trim(),
                registered_pharmacist_name:
                  values.registered_pharmacist_name.trim(),
                is_gst_registered: values.is_gst_registered,
                e_invoicing_enabled: values.e_invoicing_enabled,
                tds_applicable: values.tds_applicable,
                tcs_applicable: values.tcs_applicable,
              },
            });
            applySubmitResult(result, helpers, taxFormRef.current);
            if (result.ok) {
              setTaxNote(SAVE_COPY.tax);
            }
          }}
        >
          {(formik) => {
            const field = (name: keyof TaxFormValues) =>
              formik.touched[name]
                ? (formik.errors[name] as string)
                : undefined;
            return (
              <form
                ref={taxFormRef}
                onSubmit={formik.handleSubmit}
                noValidate
                className="flex w-full flex-col"
              >
                <SectionBlock
                  id="section-tax"
                  title="Tax and licences"
                  hint="GSTIN and PAN changes may trigger re-verification."
                  icon={Receipt}
                  footer={
                    canWrite ? (
                      <>
                        <SaveNote message={taxNote} />
                        <Button
                          type="submit"
                          disabled={formik.isSubmitting || feature.busy}
                        >
                          Save tax details
                        </Button>
                      </>
                    ) : null
                  }
                >
                  <FormBanner
                    message={asStatusMessage(formik.status)}
                    testId="tax-error"
                  />
                  <Grid cols="1" gap="3" className="sm:grid-cols-2">
                    <TextField
                      label="GSTIN"
                      name="gstin"
                      value={formik.values.gstin}
                      onChange={(event) => {
                        setTaxNote(undefined);
                        formik.handleChange(event);
                      }}
                      error={field('gstin')}
                      disabled={readOnly}
                    />
                    <TextField
                      label="PAN"
                      name="pan_number"
                      value={formik.values.pan_number}
                      onChange={(event) => {
                        setTaxNote(undefined);
                        formik.handleChange(event);
                      }}
                      error={field('pan_number')}
                      disabled={readOnly}
                    />
                    <TextField
                      label="Drug licence number"
                      name="drug_licence_number"
                      value={formik.values.drug_licence_number}
                      onChange={(event) => {
                        setTaxNote(undefined);
                        formik.handleChange(event);
                      }}
                      error={field('drug_licence_number')}
                      disabled={readOnly}
                    />
                    <TextField
                      label="FSSAI number"
                      name="fssai_number"
                      value={formik.values.fssai_number}
                      onChange={(event) => {
                        setTaxNote(undefined);
                        formik.handleChange(event);
                      }}
                      error={field('fssai_number')}
                      disabled={readOnly}
                    />
                    <TextField
                      label="Registered pharmacist"
                      name="registered_pharmacist_name"
                      value={formik.values.registered_pharmacist_name}
                      onChange={(event) => {
                        setTaxNote(undefined);
                        formik.handleChange(event);
                      }}
                      error={field('registered_pharmacist_name')}
                      disabled={readOnly}
                    />
                  </Grid>
                  <Stack
                    gap="2"
                    className="mt-3 rounded-mm border border-mm-border bg-mm-bg p-3"
                  >
                    <CheckboxField
                      id="is_gst_registered"
                      name="is_gst_registered"
                      label="GST registered"
                      checked={formik.values.is_gst_registered}
                      disabled={readOnly}
                      onChange={(checked) => {
                        setTaxNote(undefined);
                        formik.setFieldValue('is_gst_registered', checked);
                      }}
                    />
                    <CheckboxField
                      id="e_invoicing_enabled"
                      name="e_invoicing_enabled"
                      label="E-invoicing enabled"
                      checked={formik.values.e_invoicing_enabled}
                      disabled={readOnly}
                      onChange={(checked) => {
                        setTaxNote(undefined);
                        formik.setFieldValue('e_invoicing_enabled', checked);
                      }}
                    />
                    <CheckboxField
                      id="tds_applicable"
                      name="tds_applicable"
                      label="TDS applicable"
                      checked={formik.values.tds_applicable}
                      disabled={readOnly}
                      onChange={(checked) => {
                        setTaxNote(undefined);
                        formik.setFieldValue('tds_applicable', checked);
                      }}
                    />
                    <CheckboxField
                      id="tcs_applicable"
                      name="tcs_applicable"
                      label="TCS applicable"
                      checked={formik.values.tcs_applicable}
                      disabled={readOnly}
                      onChange={(checked) => {
                        setTaxNote(undefined);
                        formik.setFieldValue('tcs_applicable', checked);
                      }}
                    />
                  </Stack>
                </SectionBlock>
              </form>
            );
          }}
        </Formik>
        {bankHidden ? null : (
          <Formik
            initialValues={{
              account_holder: '',
              bank_name: '',
              account_number: '',
              ifsc_code: '',
              account_type: 'CURRENT' as const,
            }}
            validationSchema={bankSchema}
            onSubmit={async (values, helpers) => {
              const result = await feature.onSubmit({
                screen: 'profile',
                action: 'saveBank',
                values: {
                  account_holder: values.account_holder.trim(),
                  bank_name: values.bank_name.trim(),
                  account_number: values.account_number.trim(),
                  ifsc_code: values.ifsc_code.trim().toUpperCase(),
                  account_type: values.account_type,
                },
              });
              applySubmitResult(result, helpers, bankFormRef.current);
              if (result.ok) {
                helpers.resetForm();
                setBank(result.bank ?? bank);
                setBankNote(SAVE_COPY.bank);
              }
            }}
          >
            {(formik) => {
              const field = (name: keyof typeof formik.values) =>
                formik.touched[name] ? formik.errors[name] : undefined;
              return (
                <form
                  ref={bankFormRef}
                  onSubmit={formik.handleSubmit}
                  noValidate
                >
                  <SectionBlock
                    id="section-bank"
                    title="Bank account"
                    hint="Core masks the account number. Penny-drop runs on Core."
                    icon={Landmark}
                    footer={
                      <Flex align="center" gap="3" wrap>
                        <SaveNote message={bankNote} />
                        <Button
                          type="submit"
                          disabled={formik.isSubmitting || feature.busy}
                        >
                          Save bank account
                        </Button>
                      </Flex>
                    }
                  >
                    <FormBanner
                      message={asStatusMessage(formik.status)}
                      testId="bank-error"
                    />
                    {bank ? (
                      <Box
                        className="mb-4 rounded-mm border border-mm-border bg-mm-bg p-4"
                        data-testid="bank-masked"
                      >
                        <Flex align="start" justify="between" gap="3" wrap>
                          <Box className="min-w-0">
                            <Text className="font-semibold">
                              {bank.bank_name}
                            </Text>
                            <Text>{bank.account_number_masked}</Text>
                            <Text size="sm" tone="muted">
                              {bank.account_holder} · {bank.ifsc_code}
                            </Text>
                          </Box>
                          <Badge tone="primary">
                            {bank.verification_status}
                          </Badge>
                        </Flex>
                      </Box>
                    ) : (
                      <StatusMessage>No bank account on file.</StatusMessage>
                    )}
                    <Text size="sm" className="mb-3 font-semibold">
                      Replace account
                    </Text>
                    <Grid cols="1" gap="3" className="sm:grid-cols-2">
                      <TextField
                        label="Account holder"
                        name="account_holder"
                        value={formik.values.account_holder}
                        onChange={(event) => {
                          setBankNote(undefined);
                          formik.handleChange(event);
                        }}
                        error={field('account_holder')}
                        disabled={readOnly}
                        autoComplete="off"
                      />
                      <TextField
                        label="Bank name"
                        name="bank_name"
                        value={formik.values.bank_name}
                        onChange={(event) => {
                          setBankNote(undefined);
                          formik.handleChange(event);
                        }}
                        error={field('bank_name')}
                        disabled={readOnly}
                      />
                      <TextField
                        label="Account number"
                        name="account_number"
                        value={formik.values.account_number}
                        onChange={(event) => {
                          setBankNote(undefined);
                          formik.handleChange(event);
                        }}
                        error={field('account_number')}
                        disabled={readOnly}
                        autoComplete="off"
                      />
                      <TextField
                        label="IFSC"
                        name="ifsc_code"
                        value={formik.values.ifsc_code}
                        onChange={(event) => {
                          setBankNote(undefined);
                          formik.handleChange(event);
                        }}
                        error={field('ifsc_code')}
                        disabled={readOnly}
                      />
                      <SelectField
                        label="Account type"
                        name="account_type"
                        value={formik.values.account_type}
                        disabled={readOnly}
                        onChange={formik.handleChange}
                      >
                        <option value="CURRENT">Current</option>
                        <option value="SAVINGS">Savings</option>
                      </SelectField>
                    </Grid>
                  </SectionBlock>
                </form>
              );
            }}
          </Formik>
        )}
        {canWrite ? (
          <Formik
            initialValues={{ channel: 'PHONE' as const, otp: '' }}
            validationSchema={verifySchema}
            onSubmit={async (values, helpers) => {
              const result = await feature.onSubmit({
                screen: 'profile',
                action: 'verifyContact',
                values: {
                  channel: values.channel,
                  otp: values.otp.trim(),
                },
              });
              applySubmitResult(result, helpers, verifyFormRef.current);
              if (result.ok) {
                setVerifyNote(SAVE_COPY.verify);
              }
            }}
          >
            {(formik) => (
              <form
                ref={verifyFormRef}
                onSubmit={formik.handleSubmit}
                noValidate
              >
                <SectionBlock
                  id="section-verify"
                  title="Verify contact"
                  hint="Use the OTP Core sent after a phone or email change."
                  icon={ShieldCheck}
                  footer={
                    <>
                      <SaveNote message={verifyNote} />
                      <Button
                        type="submit"
                        disabled={formik.isSubmitting || feature.busy}
                      >
                        Verify contact
                      </Button>
                    </>
                  }
                >
                  <FormBanner
                    message={asStatusMessage(formik.status)}
                    testId="verify-error"
                  />
                  <Grid cols="1" gap="3" className="sm:grid-cols-2">
                    <SelectField
                      label="Channel"
                      name="channel"
                      value={formik.values.channel}
                      onChange={formik.handleChange}
                    >
                      <option value="PHONE">Phone</option>
                      <option value="EMAIL">Email</option>
                    </SelectField>
                    <Box>
                      <InputOTP
                        label="OTP"
                        value={formik.values.otp}
                        onChange={(next) => {
                          setVerifyNote(undefined);
                          void formik.setFieldValue('otp', next);
                        }}
                      />
                      {formik.touched.otp && formik.errors.otp ? (
                        <Text
                          tone="error"
                          size="sm"
                          role="alert"
                          className="mt-2"
                        >
                          {formik.errors.otp}
                        </Text>
                      ) : null}
                    </Box>
                  </Grid>
                </SectionBlock>
              </form>
            )}
          </Formik>
        ) : null}
      </Stack>
    </Grid>
  );
}

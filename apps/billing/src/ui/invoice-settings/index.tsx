import type {
  BillingFeatureData,
  InvoiceSettings,
  InvoiceSettingsPatch,
} from '@medmate/billing-contract';
import {
  billingLockCopy,
  INVOICE_TEMPLATES,
  isPlanFeatureLocked,
} from '@medmate/billing-contract';
import {
  Button,
  Fieldset,
  Flex,
  Grid,
  Heading,
  Spinner,
  Stack,
  Text,
  TextField,
} from '@medmate/ui';
import { Settings } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SETTINGS_COPY, errorText, textOrEmpty } from '../../lib/copy';
import { CheckboxField } from '../shared/checkbox-field';
import { DirtyLeaveGuard } from '../shared/dirty-leave';
import { FormBanner } from '../shared/form-error';
import { PlanLock } from '../shared/plan-lock';
import { SectionBlock } from '../shared/section-block';
import { SelectField } from '../shared/select-field';
import { TextareaField } from '../shared/textarea-field';

type FormState = {
  template: string;
  accent_color: string;
  logo_url: string;
  signature_url: string;
  document_title: string;
  invoice_prefix: string;
  signatory_label: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string;
  terms_and_conditions: string;
  footer_note: string;
  show_mrp_savings: boolean;
  show_doctor: boolean;
  show_hsn: boolean;
  print_bank_details: boolean;
};

function fromSettings(settings: InvoiceSettings | null): FormState {
  const bank = settings?.bank_details;
  return {
    template: textOrEmpty(settings?.template) || 'MODERN',
    accent_color: textOrEmpty(settings?.accent_color),
    logo_url: textOrEmpty(settings?.logo_url),
    signature_url: textOrEmpty(settings?.signature_url),
    document_title: textOrEmpty(settings?.document_title),
    invoice_prefix: textOrEmpty(settings?.invoice_prefix),
    signatory_label: textOrEmpty(settings?.signatory_label),
    bank_name: textOrEmpty(bank?.bank_name),
    account_number: textOrEmpty(bank?.account_number),
    ifsc_code: textOrEmpty(bank?.ifsc_code),
    upi_id: textOrEmpty(bank?.upi_id),
    terms_and_conditions: textOrEmpty(settings?.terms_and_conditions),
    footer_note: textOrEmpty(settings?.footer_note),
    show_mrp_savings: Boolean(settings?.show_mrp_savings),
    show_doctor: Boolean(settings?.show_doctor),
    show_hsn: Boolean(settings?.show_hsn),
    print_bank_details: Boolean(settings?.print_bank_details),
  };
}

function toPatch(form: FormState): InvoiceSettingsPatch {
  return {
    template: form.template,
    accent_color: form.accent_color,
    logo_url: form.logo_url,
    signature_url: form.signature_url,
    document_title: form.document_title,
    invoice_prefix: form.invoice_prefix,
    signatory_label: form.signatory_label,
    bank_details: {
      bank_name: form.bank_name,
      account_number: form.account_number,
      ifsc_code: form.ifsc_code,
      upi_id: form.upi_id,
    },
    terms_and_conditions: form.terms_and_conditions,
    footer_note: form.footer_note,
    show_mrp_savings: form.show_mrp_savings,
    show_doctor: form.show_doctor,
    show_hsn: form.show_hsn,
    print_bank_details: form.print_bank_details,
  };
}

export function InvoiceSettingsScreen({
  feature,
  onNavigate,
}: {
  feature: BillingFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const canPatch = Boolean(feature.canPatchSettings);
  const isStaff = feature.role === 'pharmacy_staff';
  const [form, setForm] = useState<FormState>(fromSettings(null));
  const [baseline, setBaseline] = useState<FormState>(fromSettings(null));
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(baseline),
    [baseline, form],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    setLocked(false);
    const result = await feature.onSubmit({
      screen: 'invoice-settings',
      action: 'load',
    });
    setLoading(false);
    if (!result.ok) {
      if (isPlanFeatureLocked(result.code)) {
        setLocked(true);
        return;
      }
      setError(errorText(result, 'Unable to load invoice settings.'));
      return;
    }
    const next = fromSettings(result.settings ?? null);
    setForm(next);
    setBaseline(next);
  }, [feature]);

  useEffect(() => {
    void load();
  }, [load]);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setBusy(true);
    setFieldErrors({});
    const result = await feature.onSubmit({
      screen: 'invoice-settings',
      action: 'save',
      values: toPatch(form),
    });
    setBusy(false);
    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {});
      setError(errorText(result));
      if (result.code === 'FORBIDDEN') {
        return;
      }
      return;
    }
    const next = fromSettings(result.settings ?? toPatch(form));
    setForm(next);
    setBaseline(next);
    setError(undefined);
  }

  if (loading) {
    return <Spinner size="sm" data-testid="invoice-settings-loading" />;
  }
  if (locked) {
    return (
      <PlanLock
        testId="invoice-settings-plan-lock"
        message={billingLockCopy()}
        viewPlansLabel={SETTINGS_COPY.viewPlans}
        onViewPlans={() => onNavigate?.('/subscription')}
        isStaff={isStaff}
      />
    );
  }

  return (
    <Stack gap="3">
      <DirtyLeaveGuard
        dirty={dirty}
        onNavigate={onNavigate}
        description={SETTINGS_COPY.dirtyLeave}
      />
      <FormBanner message={error} testId="invoice-settings-error" />
      {error ? (
        <Button
          type="button"
          variant="ghost"
          className="min-h-10 px-2 text-sm"
          onClick={() => void load()}
        >
          {SETTINGS_COPY.retry}
        </Button>
      ) : null}
      {!canPatch ? (
        <Text data-testid="invoice-settings-readonly" role="status">
          {SETTINGS_COPY.staffReadOnly}
        </Text>
      ) : null}
      <SectionBlock
        id="section-invoice-settings"
        title={SETTINGS_COPY.sectionTitle}
        hint={SETTINGS_COPY.sectionHint}
        icon={Settings}
        footer={
          canPatch ? (
            <Button
              type="button"
              className="min-h-10 px-2 text-sm"
              disabled={busy || !dirty}
              onClick={() => void save()}
            >
              {SETTINGS_COPY.save}
            </Button>
          ) : undefined
        }
      >
        <Stack gap="3">
          <Fieldset className="p-3">
            <Heading level={3} className="mb-2 text-sm">
              {SETTINGS_COPY.identityGroup}
            </Heading>
            <Grid gap="2" className="grid-cols-1 sm:grid-cols-2">
              <SelectField
                label={SETTINGS_COPY.template}
                name="template"
                value={form.template}
                disabled={!canPatch}
                onChange={(event) => patch('template', event.target.value)}
              >
                {INVOICE_TEMPLATES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectField>
              <TextField
                label={SETTINGS_COPY.accent}
                name="accent_color"
                value={form.accent_color}
                disabled={!canPatch}
                error={fieldErrors.accent_color}
                onChange={(event) => patch('accent_color', event.target.value)}
              />
              <TextField
                label={SETTINGS_COPY.prefix}
                name="invoice_prefix"
                value={form.invoice_prefix}
                disabled={!canPatch}
                error={fieldErrors.invoice_prefix}
                onChange={(event) =>
                  patch('invoice_prefix', event.target.value)
                }
              />
              <TextField
                label={SETTINGS_COPY.title}
                name="document_title"
                value={form.document_title}
                disabled={!canPatch}
                onChange={(event) =>
                  patch('document_title', event.target.value)
                }
              />
              <TextField
                label={SETTINGS_COPY.signatory}
                name="signatory_label"
                value={form.signatory_label}
                disabled={!canPatch}
                onChange={(event) =>
                  patch('signatory_label', event.target.value)
                }
              />
              <TextField
                label={SETTINGS_COPY.logo}
                name="logo_url"
                value={form.logo_url}
                disabled={!canPatch}
                onChange={(event) => patch('logo_url', event.target.value)}
              />
              <TextField
                label={SETTINGS_COPY.signature}
                name="signature_url"
                value={form.signature_url}
                disabled={!canPatch}
                onChange={(event) => patch('signature_url', event.target.value)}
              />
            </Grid>
          </Fieldset>
          <Fieldset className="p-3">
            <Heading level={3} className="mb-2 text-sm">
              {SETTINGS_COPY.bankGroup}
            </Heading>
            <Grid gap="2" className="grid-cols-1 sm:grid-cols-2">
              <TextField
                label={SETTINGS_COPY.bankName}
                name="bank_name"
                value={form.bank_name}
                disabled={!canPatch}
                onChange={(event) => patch('bank_name', event.target.value)}
              />
              <TextField
                label={SETTINGS_COPY.account}
                name="account_number"
                value={form.account_number}
                disabled={!canPatch}
                onChange={(event) =>
                  patch('account_number', event.target.value)
                }
              />
              <TextField
                label={SETTINGS_COPY.ifsc}
                name="ifsc_code"
                value={form.ifsc_code}
                disabled={!canPatch}
                error={fieldErrors.ifsc_code}
                onChange={(event) => patch('ifsc_code', event.target.value)}
              />
              <TextField
                label={SETTINGS_COPY.upi}
                name="upi_id"
                value={form.upi_id}
                disabled={!canPatch}
                onChange={(event) => patch('upi_id', event.target.value)}
              />
            </Grid>
          </Fieldset>
          <TextareaField
            label={SETTINGS_COPY.terms}
            name="terms_and_conditions"
            value={form.terms_and_conditions}
            disabled={!canPatch}
            onChange={(event) =>
              patch('terms_and_conditions', event.target.value)
            }
          />
          <TextareaField
            label={SETTINGS_COPY.footer}
            name="footer_note"
            value={form.footer_note}
            disabled={!canPatch}
            onChange={(event) => patch('footer_note', event.target.value)}
          />
          <Fieldset className="p-3">
            <Heading level={3} className="mb-2 text-sm">
              {SETTINGS_COPY.printGroup}
            </Heading>
            <Flex gap="3" wrap>
              <CheckboxField
                id="show_mrp_savings"
                name="show_mrp_savings"
                label={SETTINGS_COPY.showMrp}
                checked={form.show_mrp_savings}
                disabled={!canPatch}
                onChange={(checked) => patch('show_mrp_savings', checked)}
              />
              <CheckboxField
                id="show_doctor"
                name="show_doctor"
                label={SETTINGS_COPY.showDoctor}
                checked={form.show_doctor}
                disabled={!canPatch}
                onChange={(checked) => patch('show_doctor', checked)}
              />
              <CheckboxField
                id="show_hsn"
                name="show_hsn"
                label={SETTINGS_COPY.showHsn}
                checked={form.show_hsn}
                disabled={!canPatch}
                onChange={(checked) => patch('show_hsn', checked)}
              />
              <CheckboxField
                id="print_bank_details"
                name="print_bank_details"
                label={SETTINGS_COPY.printBank}
                checked={form.print_bank_details}
                disabled={!canPatch}
                onChange={(checked) => patch('print_bank_details', checked)}
              />
            </Flex>
          </Fieldset>
        </Stack>
      </SectionBlock>
    </Stack>
  );
}

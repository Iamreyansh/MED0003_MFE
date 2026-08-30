import type {
  CsvImportPreview,
  ProcurementFeatureData,
} from '@medmate/procurement-contract';
import { isCsvTooLarge } from '@medmate/procurement-contract';
import { Button, Flex, Stack, Text, TextField } from '@medmate/ui';
import { useState } from 'react';
import { CSV_COPY, PURCHASES_COPY, errorText } from '../../lib/copy';
import { FormBanner } from '../shared/form-error';
import { SectionBlock } from '../shared/section-block';

export function CsvWizard({
  feature,
  onImported,
}: {
  feature: ProcurementFeatureData;
  onImported: (grnId: string) => void;
}) {
  const canAccessGrowth = feature.canAccessGrowth !== false;
  const [distributorId, setDistributorId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvImportPreview | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  async function upload() {
    if (!file) {
      setError('Choose a CSV file.');
      return;
    }
    if (isCsvTooLarge(file)) {
      setError(CSV_COPY.tooLarge);
      return;
    }
    setBusy(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'purchases',
      action: 'importCsv',
      values: {
        file,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        ...(distributorId.trim()
          ? { distributor_id: distributorId.trim() }
          : {}),
      },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    setPreview(result.importPreview ?? { grn_id: result.grn?.grn_id });
  }

  async function confirm() {
    const grnId = preview?.grn_id;
    if (!grnId) {
      return;
    }
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'purchases',
      action: 'confirmImport',
      values: { grn_id: grnId },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    onImported(grnId);
  }

  return (
    <SectionBlock id="section-csv" title={CSV_COPY.title} hint={CSV_COPY.hint}>
      <Stack gap="3">
        <FormBanner message={error} testId="csv-error" />
        {canAccessGrowth ? (
          <TextField
            label={PURCHASES_COPY.distributorId}
            name="csv_distributor_id"
            value={distributorId}
            onChange={(event) => setDistributorId(event.target.value)}
          />
        ) : (
          <Text data-testid="csv-walk-in-hint">
            {PURCHASES_COPY.walkInHint}
          </Text>
        )}
        <TextField
          label={PURCHASES_COPY.invoiceNumber}
          name="csv_invoice_number"
          value={invoiceNumber}
          onChange={(event) => setInvoiceNumber(event.target.value)}
        />
        <TextField
          label={PURCHASES_COPY.invoiceDate}
          name="csv_invoice_date"
          type="date"
          value={invoiceDate}
          onChange={(event) => setInvoiceDate(event.target.value)}
        />
        <Flex direction="column" gap="2">
          <label htmlFor="csv-file">{CSV_COPY.file}</label>
          <input
            id="csv-file"
            name="csv_file"
            type="file"
            accept=".csv,text/csv"
            data-testid="csv-file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </Flex>
        <Flex gap="2" wrap>
          <Button type="button" disabled={busy} onClick={() => void upload()}>
            {CSV_COPY.upload}
          </Button>
          {preview ? (
            <Button
              type="button"
              disabled={busy}
              onClick={() => void confirm()}
            >
              {CSV_COPY.confirm}
            </Button>
          ) : null}
        </Flex>
        {preview?.grn_id ? (
          <Text data-testid="csv-grn-id">
            {CSV_COPY.previewReady} {preview.grn_id}
          </Text>
        ) : null}
        {preview?.unmatched_items && preview.unmatched_items.length > 0 ? (
          <ul data-testid="csv-unmatched">
            {preview.unmatched_items.map((row) => (
              <li key={`${row.row_number}-${row.raw_data?.product_name}`}>
                {CSV_COPY.unmatched} {row.row_number}:{' '}
                {row.raw_data?.product_name}
              </li>
            ))}
          </ul>
        ) : null}
      </Stack>
    </SectionBlock>
  );
}

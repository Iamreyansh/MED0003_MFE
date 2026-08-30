import type {
  GrnListRow,
  PageMeta,
  ProcurementFeatureData,
  PurchaseKpi,
} from '@medmate/procurement-contract';
import { formatInr } from '@medmate/procurement-contract';
import {
  Badge,
  Button,
  Flex,
  Spinner,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TextField,
} from '@medmate/ui';
import { Receipt } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  PURCHASES_COPY,
  dash,
  errorText,
  listOf,
  pageMeta,
} from '../../lib/copy';
import { EmptyState } from '../shared/empty-state';
import { FormBanner } from '../shared/form-error';
import { Pager } from '../shared/pager';
import { SectionBlock } from '../shared/section-block';
import { CsvWizard } from './csv-wizard';
import { PurchaseSummary } from './summary';

export function PurchasesScreen({
  feature,
  onNavigate,
}: {
  feature: ProcurementFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const canWrite = feature.canWrite !== false;
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [rows, setRows] = useState<GrnListRow[]>([]);
  const [kpi, setKpi] = useState<PurchaseKpi | null>(null);
  const [meta, setMeta] = useState<PageMeta>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [distributorId, setDistributorId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [showCsv, setShowCsv] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'purchases',
      action: 'load',
      values: { page, status: status || undefined },
    });
    setLoading(false);
    if (!result.ok) {
      setError(errorText(result, 'Unable to load purchases.'));
      setRows([]);
      return;
    }
    setRows(listOf(result.grns));
    setKpi((result.kpi as PurchaseKpi) ?? null);
    setMeta(pageMeta(result.meta));
  }, [feature, page, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createGrn() {
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'purchases',
      action: 'create',
      values: {
        distributor_id: distributorId,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
      },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    const grnId = result.grn?.grn_id;
    if (grnId) {
      onNavigate?.(`/purchases/${grnId}`);
    }
  }

  return (
    <Stack gap="4">
      {kpi ? <PurchaseSummary kpi={kpi} /> : null}
      {canWrite ? (
        <Flex gap="3" wrap align="end">
          <TextField
            label={PURCHASES_COPY.distributorId}
            name="distributor_id"
            value={distributorId}
            onChange={(event) => setDistributorId(event.target.value)}
          />
          <TextField
            label={PURCHASES_COPY.invoiceNumber}
            name="invoice_number"
            value={invoiceNumber}
            onChange={(event) => setInvoiceNumber(event.target.value)}
          />
          <TextField
            label={PURCHASES_COPY.invoiceDate}
            name="invoice_date"
            type="date"
            value={invoiceDate}
            onChange={(event) => setInvoiceDate(event.target.value)}
          />
          <Button
            type="button"
            disabled={busy}
            onClick={() => void createGrn()}
          >
            {PURCHASES_COPY.create}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowCsv((open) => !open)}
          >
            {PURCHASES_COPY.importCsv}
          </Button>
        </Flex>
      ) : null}
      {showCsv ? (
        <CsvWizard
          feature={feature}
          onImported={(grnId) => onNavigate?.(`/purchases/${grnId}`)}
        />
      ) : null}
      <TextField
        label={PURCHASES_COPY.status}
        name="status"
        value={status}
        onChange={(event) => {
          setPage(1);
          setStatus(event.target.value);
        }}
      />
      <FormBanner message={error} testId="purchases-error" />
      {error ? (
        <Button type="button" variant="ghost" onClick={() => void load()}>
          {PURCHASES_COPY.retry}
        </Button>
      ) : null}
      {loading ? <Spinner data-testid="purchases-loading" /> : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState icon={Receipt} testId="purchases-empty">
          {PURCHASES_COPY.empty}
        </EmptyState>
      ) : null}
      {rows.length > 0 ? (
        <SectionBlock
          id="section-grns"
          title={PURCHASES_COPY.sectionTitle}
          hint={PURCHASES_COPY.sectionHint}
          icon={Receipt}
        >
          <Table
            aria-label={PURCHASES_COPY.tableLabel}
            data-testid="purchases-table"
          >
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Distributor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.grn_id}
                  data-testid={`grn-row-${row.grn_id}`}
                >
                  <TableCell>{dash(row.invoice_number)}</TableCell>
                  <TableCell>{dash(row.distributor_name)}</TableCell>
                  <TableCell>
                    <Badge>{dash(row.status)}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatInr(row.total)}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onNavigate?.(`/purchases/${row.grn_id}`)}
                    >
                      {PURCHASES_COPY.open}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionBlock>
      ) : null}
      <Pager
        page={page}
        hasNext={Boolean(meta.has_next)}
        previousLabel={PURCHASES_COPY.previous}
        nextLabel={PURCHASES_COPY.next}
        pageLabel={PURCHASES_COPY.page}
        onPage={setPage}
        disabled={loading}
      />
    </Stack>
  );
}

import type {
  BillingFeatureData,
  InvoiceListRow,
  PageMeta,
} from '@medmate/billing-contract';
import { formatInr } from '@medmate/billing-contract';
import {
  Button,
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
  INVOICES_COPY,
  dash,
  errorText,
  listOf,
  pageMeta,
} from '../../lib/copy';
import { EmptyState } from '../shared/empty-state';
import { FilterField, FilterToolbar } from '../shared/filter-toolbar';
import { FormBanner } from '../shared/form-error';
import { Pager } from '../shared/pager';
import { TableShell } from '../shared/section-block';
import { StatusBadge } from '../shared/status-badge';

const compactBtn = 'min-h-10 px-2 text-sm';

export function InvoicesScreen({
  feature,
  onNavigate,
}: {
  feature: BillingFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [channel, setChannel] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<InvoiceListRow[]>([]);
  const [meta, setMeta] = useState<PageMeta>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const filters = {
      page,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      channel: channel || undefined,
      payment_method: paymentMethod || undefined,
      q: query || undefined,
    };
    setLoading(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'invoices',
      action: 'load',
      values: filters,
    });
    setLoading(false);
    if (!result.ok) {
      setError(errorText(result, 'Unable to load invoices.'));
      setRows([]);
      return;
    }
    setRows(listOf(result.invoices));
    setMeta(pageMeta(result.meta));
  }, [feature, page, fromDate, toDate, channel, paymentMethod, query]);

  useEffect(() => {
    void load();
  }, [load]);

  async function exportExcel() {
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'invoices',
      action: 'exportExcel',
      values: {
        page,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        channel: channel || undefined,
        payment_method: paymentMethod || undefined,
        q: query || undefined,
      },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
    }
  }

  function openInvoice(row: InvoiceListRow) {
    onNavigate?.(`/invoices/${row.invoice_id}`);
  }

  return (
    <Stack gap="3">
      <FilterToolbar
        actions={
          <Button
            type="button"
            variant="ghost"
            className={compactBtn}
            disabled={busy}
            onClick={() => void exportExcel()}
          >
            {INVOICES_COPY.exportExcel}
          </Button>
        }
      >
        <FilterField grow>
          <TextField
            label={INVOICES_COPY.search}
            name="q"
            value={query}
            onChange={(event) => {
              setPage(1);
              setQuery(event.target.value);
            }}
          />
        </FilterField>
        <FilterField>
          <TextField
            label={INVOICES_COPY.fromDate}
            name="from_date"
            type="date"
            value={fromDate}
            onChange={(event) => {
              setPage(1);
              setFromDate(event.target.value);
            }}
          />
        </FilterField>
        <FilterField>
          <TextField
            label={INVOICES_COPY.toDate}
            name="to_date"
            type="date"
            value={toDate}
            onChange={(event) => {
              setPage(1);
              setToDate(event.target.value);
            }}
          />
        </FilterField>
        <FilterField>
          <TextField
            label={INVOICES_COPY.channel}
            name="channel"
            value={channel}
            onChange={(event) => {
              setPage(1);
              setChannel(event.target.value);
            }}
          />
        </FilterField>
        <FilterField>
          <TextField
            label={INVOICES_COPY.paymentMethod}
            name="payment_method"
            value={paymentMethod}
            onChange={(event) => {
              setPage(1);
              setPaymentMethod(event.target.value);
            }}
          />
        </FilterField>
      </FilterToolbar>
      <FormBanner message={error} testId="invoices-error" />
      {error ? (
        <Button
          type="button"
          variant="ghost"
          className={compactBtn}
          onClick={() => void load()}
        >
          {INVOICES_COPY.retry}
        </Button>
      ) : null}
      {loading ? <Spinner size="sm" data-testid="invoices-loading" /> : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState
          icon={Receipt}
          testId="invoices-empty"
          actions={
            <Button
              type="button"
              className={compactBtn}
              onClick={() => onNavigate?.('/pos')}
            >
              {INVOICES_COPY.openPos}
            </Button>
          }
        >
          {INVOICES_COPY.empty}
        </EmptyState>
      ) : null}
      {rows.length > 0 ? (
        <TableShell id="section-invoices">
          <Table
            aria-label={INVOICES_COPY.tableLabel}
            data-testid="invoices-table"
          >
            <TableHeader>
              <TableRow>
                <TableHead className="px-2">Invoice</TableHead>
                <TableHead className="px-2">Date</TableHead>
                <TableHead className="px-2">Customer</TableHead>
                <TableHead className="px-2">Status</TableHead>
                <TableHead className="px-2">Total</TableHead>
                <TableHead className="px-2">Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.invoice_id}
                  data-testid={`invoice-row-${row.invoice_id}`}
                  className="cursor-pointer transition-colors duration-mm mx-2"
                  onClick={() => openInvoice(row)}
                >
                  <TableCell className="px-2">
                    {dash(row.invoice_number)}
                  </TableCell>
                  <TableCell className="px-2">{dash(row.date)}</TableCell>
                  <TableCell className="px-2 max-w-[12rem] truncate">
                    {dash(row.customer_name)}
                  </TableCell>
                  <TableCell className="px-2">
                    <StatusBadge status={row.payment_status} />
                  </TableCell>
                  <TableCell className="tabular-nums px-2">
                    {formatInr(row.grand_total)}
                  </TableCell>
                  <TableCell className="px-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className={compactBtn}
                      onClick={(event) => {
                        event.stopPropagation();
                        openInvoice(row);
                      }}
                    >
                      {INVOICES_COPY.open}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
      ) : null}
      <Pager
        page={page}
        hasNext={Boolean(meta.has_next)}
        previousLabel={INVOICES_COPY.previous}
        nextLabel={INVOICES_COPY.next}
        pageLabel={INVOICES_COPY.page}
        onPage={setPage}
        disabled={loading}
      />
    </Stack>
  );
}

import type {
  BillingFeatureData,
  MarkPaidMode,
  PageMeta,
  SaleDetail,
  SalesListRow,
  SalesSummary,
} from '@medmate/billing-contract';
import { formatInr, MARK_PAID_MODES } from '@medmate/billing-contract';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Spinner,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  TextField,
} from '@medmate/ui';
import { BookOpen } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { SALES_COPY, dash, errorText, listOf, pageMeta } from '../../lib/copy';
import { applyDialogOpen } from '../../lib/dialog';
import { EmptyState } from '../shared/empty-state';
import { FilterField, FilterToolbar } from '../shared/filter-toolbar';
import { FormBanner } from '../shared/form-error';
import { Pager } from '../shared/pager';
import { TableShell } from '../shared/section-block';
import { SelectField } from '../shared/select-field';
import { StatusBadge } from '../shared/status-badge';
import { SalesSummaryCards } from './summary';

const compactBtn = 'min-h-10 px-2 text-sm';

export function SalesScreen({ feature }: { feature: BillingFeatureData }) {
  const canMarkPaid = Boolean(feature.canMarkPaid);
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [channel, setChannel] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<SalesListRow[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [meta, setMeta] = useState<PageMeta>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [busy, setBusy] = useState(false);
  const [sale, setSale] = useState<SaleDetail | null>(null);
  const [pendingSale, setPendingSale] = useState<SalesListRow | null>(null);
  const [paymentMode, setPaymentMode] = useState<MarkPaidMode>('CASH');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    const filters = {
      page,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      channel: channel || undefined,
      payment_method: paymentMethod || undefined,
      payment_status: paymentStatus || undefined,
      q: query || undefined,
    };
    setLoading(true);
    setError(undefined);
    const [list, cards] = await Promise.all([
      feature.onSubmit({ screen: 'sales', action: 'load', values: filters }),
      feature.onSubmit({
        screen: 'sales',
        action: 'loadSummary',
        values: { from_date: filters.from_date, to_date: filters.to_date },
      }),
    ]);
    setLoading(false);
    if (!list.ok) {
      setError(errorText(list, 'Unable to load sales.'));
      setRows([]);
      return;
    }
    setRows(listOf(list.sales));
    setMeta(pageMeta(list.meta));
    setSummary(cards.ok ? (cards.summary ?? null) : null);
  }, [
    feature,
    page,
    fromDate,
    toDate,
    channel,
    paymentMethod,
    paymentStatus,
    query,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  async function exportExcel() {
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'sales',
      action: 'exportExcel',
      values: {
        page,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        channel: channel || undefined,
        payment_method: paymentMethod || undefined,
        payment_status: paymentStatus || undefined,
        q: query || undefined,
      },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
    }
  }

  async function openSale(row: SalesListRow) {
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'sales',
      action: 'loadSale',
      values: { saleId: row.sale_id },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result, 'Unable to load sale.'));
      setSale(null);
      return;
    }
    setSale(result.sale ?? null);
  }

  async function confirmPaid(row: SalesListRow) {
    const parsed = Number(amount);
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'sales',
      action: 'markPaid',
      values: {
        saleId: row.sale_id,
        payment_mode: paymentMode,
        amount: parsed,
        reference_number: reference || undefined,
        note: note || undefined,
      },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
      return;
    }
    setPendingSale(null);
    await load();
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
            {SALES_COPY.exportExcel}
          </Button>
        }
      >
        <FilterField grow>
          <TextField
            label={SALES_COPY.search}
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
            label={SALES_COPY.fromDate}
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
            label={SALES_COPY.toDate}
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
            label={SALES_COPY.channel}
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
            label={SALES_COPY.paymentMethod}
            name="payment_method"
            value={paymentMethod}
            onChange={(event) => {
              setPage(1);
              setPaymentMethod(event.target.value);
            }}
          />
        </FilterField>
        <FilterField>
          <TextField
            label={SALES_COPY.paymentStatus}
            name="payment_status"
            value={paymentStatus}
            onChange={(event) => {
              setPage(1);
              setPaymentStatus(event.target.value);
            }}
          />
        </FilterField>
      </FilterToolbar>
      {summary ? <SalesSummaryCards summary={summary} /> : null}
      <FormBanner message={error} testId="sales-error" />
      {error ? (
        <Button
          type="button"
          variant="ghost"
          className={compactBtn}
          onClick={() => void load()}
        >
          {SALES_COPY.retry}
        </Button>
      ) : null}
      {loading ? <Spinner size="sm" data-testid="sales-loading" /> : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState icon={BookOpen} testId="sales-empty">
          {SALES_COPY.empty}
        </EmptyState>
      ) : null}
      {rows.length > 0 ? (
        <TableShell id="section-sales">
          <Table aria-label={SALES_COPY.tableLabel} data-testid="sales-table">
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Open</TableHead>
                {canMarkPaid ? <TableHead>Collect</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.sale_id}
                  data-testid={`sale-row-${row.sale_id}`}
                  className="cursor-pointer transition-colors duration-mm"
                  onClick={() => void openSale(row)}
                >
                  <TableCell>{dash(row.invoice_number)}</TableCell>
                  <TableCell>{dash(row.date)}</TableCell>
                  <TableCell className="max-w-[12rem] truncate">
                    {dash(row.customer_name)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.payment_status} />
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatInr(row.grand_total)}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      className={compactBtn}
                      onClick={(event) => {
                        event.stopPropagation();
                        void openSale(row);
                      }}
                    >
                      {SALES_COPY.open}
                    </Button>
                  </TableCell>
                  {canMarkPaid ? (
                    <TableCell>
                      {row.payment_status !== 'PAID' ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className={compactBtn}
                          onClick={(event) => {
                            event.stopPropagation();
                            setPendingSale(row);
                            setAmount(
                              row.grand_total != null
                                ? String(row.grand_total)
                                : '',
                            );
                          }}
                        >
                          {SALES_COPY.markPaid}
                        </Button>
                      ) : null}
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
      ) : null}
      <Pager
        page={page}
        hasNext={Boolean(meta.has_next)}
        previousLabel={SALES_COPY.previous}
        nextLabel={SALES_COPY.next}
        pageLabel={SALES_COPY.page}
        onPage={setPage}
        disabled={loading}
      />
      <Dialog
        open={Boolean(sale)}
        onOpenChange={(open) => applyDialogOpen(open, () => setSale(null))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dash(sale?.invoice_number)}</DialogTitle>
          </DialogHeader>
          <Text data-testid="sale-detail" className="tabular-nums">
            {formatInr(sale?.grand_total)} · {dash(sale?.payment_status)}
          </Text>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              className={compactBtn}
              onClick={() => setSale(null)}
            >
              {SALES_COPY.closeDetail}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(pendingSale)}
        onOpenChange={(open) =>
          applyDialogOpen(open, () => setPendingSale(null))
        }
      >
        <DialogContent data-testid="mark-paid-dialog">
          <DialogHeader>
            <DialogTitle>{SALES_COPY.confirmTitle}</DialogTitle>
            <DialogDescription>{SALES_COPY.confirmHelp}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void confirmPaid(pendingSale as SalesListRow);
            }}
          >
            <Stack gap="2">
              <SelectField
                label={SALES_COPY.paymentMode}
                name="payment_mode"
                value={paymentMode}
                onChange={(event) =>
                  setPaymentMode(event.target.value as MarkPaidMode)
                }
              >
                {MARK_PAID_MODES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectField>
              <TextField
                label={SALES_COPY.amount}
                name="amount"
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
              <TextField
                label={SALES_COPY.reference}
                name="reference_number"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
              />
              <TextField
                label={SALES_COPY.note}
                name="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </Stack>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                className={compactBtn}
                onClick={() => setPendingSale(null)}
              >
                {SALES_COPY.cancel}
              </Button>
              <Button type="submit" className={compactBtn} disabled={busy}>
                {SALES_COPY.confirm}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

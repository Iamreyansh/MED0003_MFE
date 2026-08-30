import type {
  OrdersFeatureData,
  PageMeta,
  RxQuoteRow,
} from '@medmate/orders-contract';
import {
  QUOTE_STATUS_FILTERS,
  isExpiredQuote,
  isPriceAboveMrp,
} from '@medmate/orders-contract';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Flex,
  Spinner,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@medmate/ui';
import { ClipboardList } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  QUOTES_COPY,
  dash,
  errorText,
  formatIstDate,
  listOf,
  pageMeta,
} from '../../lib/copy';
import { applyDialogOpen } from '../../lib/dialog';
import { EmptyState } from '../shared/empty-state';
import { FilterField, FilterToolbar } from '../shared/filter-toolbar';
import { FormBanner } from '../shared/form-error';
import { InputField } from '../shared/input-field';
import { Pager } from '../shared/pager';
import { TableShell } from '../shared/section-block';
import { SelectField } from '../shared/select-field';
import { StatusBadge } from '../shared/status-badge';
import { TextareaField } from '../shared/textarea-field';

const compactBtn = 'min-h-10 px-2 text-sm';

export function RxQuotesScreen({ feature }: { feature: OrdersFeatureData }) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('NOTIFIED');
  const [rows, setRows] = useState<RxQuoteRow[]>([]);
  const [meta, setMeta] = useState<PageMeta>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [busy, setBusy] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [activeId, setActiveId] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');
  const [priceError, setPriceError] = useState<string | undefined>();
  const [reasonError, setReasonError] = useState<string | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'rx-quotes',
      action: 'load',
      values: { page, limit: 20, status: status || undefined },
    });
    setLoading(false);
    if (!result.ok) {
      setError(errorText(result, 'Unable to load quotes.'));
      return;
    }
    setRows(listOf(result.quotes));
    setMeta(pageMeta(result.meta));
  }, [feature, page, status]);

  useEffect(() => {
    void load();
  }, [load]);

  function openQuote(quoteId: string) {
    setActiveId(quoteId);
    setPrice('');
    setNotes('');
    setPriceError(undefined);
    setQuoteOpen(true);
  }

  function openDecline(quoteId: string) {
    setActiveId(quoteId);
    setReason('');
    setReasonError(undefined);
    setDeclineOpen(true);
  }

  async function confirmQuote() {
    const amount = Number(price);
    if (!Number.isFinite(amount) || amount <= 0) {
      setPriceError('Enter a price.');
      return;
    }
    setBusy(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'rx-quotes',
      action: 'quote',
      values: {
        quoteId: activeId,
        price: amount,
        notes: notes.trim() || undefined,
      },
    });
    setBusy(false);
    if (!result.ok) {
      setError(
        isPriceAboveMrp(result.code)
          ? errorText(result, 'Quoted price is above MRP.')
          : errorText(result),
      );
      setPriceError(result.fieldErrors?.price);
      return;
    }
    setQuoteOpen(false);
    await load();
  }

  async function confirmDecline() {
    setBusy(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'rx-quotes',
      action: 'decline',
      values: { quoteId: activeId, reason: reason.trim() || undefined },
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(result));
      setReasonError(result.fieldErrors?.reason);
      return;
    }
    setDeclineOpen(false);
    await load();
  }

  return (
    <Stack gap="3">
      <FilterToolbar>
        <FilterField>
          <SelectField
            label={QUOTES_COPY.status}
            name="status"
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
          >
            {QUOTE_STATUS_FILTERS.map((value) => (
              <option key={value || 'all'} value={value}>
                {value || QUOTES_COPY.allStatuses}
              </option>
            ))}
          </SelectField>
        </FilterField>
      </FilterToolbar>
      <FormBanner message={error} testId="orders-quotes-error" />
      {error ? (
        <Button
          type="button"
          variant="ghost"
          className={compactBtn}
          onClick={() => void load()}
        >
          {QUOTES_COPY.retry}
        </Button>
      ) : null}
      {loading ? (
        <Spinner size="sm" data-testid="orders-quotes-loading" />
      ) : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState icon={ClipboardList} testId="orders-quotes-empty">
          {QUOTES_COPY.empty}
        </EmptyState>
      ) : null}
      {rows.length > 0 ? (
        <TableShell id="section-rx-quotes">
          <Table
            aria-label={QUOTES_COPY.tableLabel}
            data-testid="orders-quotes-table"
          >
            <TableHeader>
              <TableRow>
                <TableHead>Quote</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const expired = isExpiredQuote(row.status);
                return (
                  <TableRow
                    key={row.quote_id}
                    data-testid={`orders-quote-${row.quote_id}`}
                  >
                    <TableCell>{row.quote_id}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell>{formatIstDate(row.created_at)}</TableCell>
                    <TableCell>
                      {expired ? (
                        <span
                          data-testid={`orders-quote-readonly-${row.quote_id}`}
                        >
                          {dash(row.status)}
                        </span>
                      ) : (
                        <Flex gap="2">
                          <Button
                            type="button"
                            className={compactBtn}
                            disabled={busy}
                            onClick={() => openQuote(row.quote_id)}
                          >
                            {QUOTES_COPY.quote}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className={compactBtn}
                            disabled={busy}
                            onClick={() => openDecline(row.quote_id)}
                          >
                            {QUOTES_COPY.decline}
                          </Button>
                        </Flex>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableShell>
      ) : null}
      <Pager
        page={page}
        hasNext={Boolean(meta.has_next)}
        previousLabel={QUOTES_COPY.previous}
        nextLabel={QUOTES_COPY.next}
        pageLabel={QUOTES_COPY.page}
        onPage={setPage}
        disabled={loading}
      />
      <Dialog
        open={quoteOpen}
        onOpenChange={(open) =>
          applyDialogOpen(open, () => {
            setQuoteOpen(false);
            setPriceError(undefined);
          })
        }
      >
        <DialogContent data-testid="orders-quote-dialog">
          <DialogHeader>
            <DialogTitle>{QUOTES_COPY.quoteTitle}</DialogTitle>
            <DialogDescription>{QUOTES_COPY.quoteHelp}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void confirmQuote();
            }}
          >
            <InputField
              label={QUOTES_COPY.price}
              name="price"
              type="number"
              inputMode="decimal"
              value={price}
              error={priceError}
              onChange={(event) => {
                setPrice(event.target.value);
                setPriceError(undefined);
              }}
            />
            <TextareaField
              label={QUOTES_COPY.notes}
              name="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                className={compactBtn}
                onClick={() => setQuoteOpen(false)}
              >
                {QUOTES_COPY.cancel}
              </Button>
              <Button type="submit" className={compactBtn} disabled={busy}>
                {QUOTES_COPY.quoteConfirm}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={declineOpen}
        onOpenChange={(open) =>
          applyDialogOpen(open, () => {
            setDeclineOpen(false);
            setReasonError(undefined);
          })
        }
      >
        <DialogContent data-testid="orders-decline-dialog">
          <DialogHeader>
            <DialogTitle>{QUOTES_COPY.declineTitle}</DialogTitle>
            <DialogDescription>{QUOTES_COPY.declineHelp}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void confirmDecline();
            }}
          >
            <TextareaField
              label={QUOTES_COPY.declineReason}
              name="reason"
              value={reason}
              error={reasonError}
              onChange={(event) => {
                setReason(event.target.value);
                setReasonError(undefined);
              }}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                className={compactBtn}
                onClick={() => setDeclineOpen(false)}
              >
                {QUOTES_COPY.cancel}
              </Button>
              <Button type="submit" className={compactBtn} disabled={busy}>
                {QUOTES_COPY.declineConfirm}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

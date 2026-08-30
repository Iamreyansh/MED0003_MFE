import type {
  BillingFeatureData,
  KhataAging,
  KhataCustomerRow,
  KhataKpi,
  KhataPaymentRow,
  PageMeta,
} from '@medmate/billing-contract';
import {
  formatInr,
  isPlanFeatureLocked,
  khataLockCopy,
} from '@medmate/billing-contract';
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
import { BookOpen } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  KHATA_COPY,
  dash,
  errorText,
  formatIstDate,
  listOf,
  pageMeta,
} from '../../lib/copy';
import { EmptyState } from '../shared/empty-state';
import { FilterField, FilterToolbar } from '../shared/filter-toolbar';
import { FormBanner } from '../shared/form-error';
import { Pager } from '../shared/pager';
import { PlanLock } from '../shared/plan-lock';
import { TableShell } from '../shared/section-block';
import { SelectField } from '../shared/select-field';
import { StatusBadge } from '../shared/status-badge';
import { KhataSummaryCards } from './summary';

const compactBtn = 'min-h-10 px-2 text-sm';

export function KhataScreen({
  feature,
  onNavigate,
}: {
  feature: BillingFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const isStaff = feature.role === 'pharmacy_staff';
  const [tab, setTab] = useState<'debtors' | 'payments'>('debtors');
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [sort, setSort] = useState('outstanding_desc');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [rows, setRows] = useState<KhataCustomerRow[]>([]);
  const [repayments, setRepayments] = useState<KhataPaymentRow[]>([]);
  const [kpi, setKpi] = useState<KhataKpi | null>(null);
  const [aging, setAging] = useState<KhataAging | null>(null);
  const [meta, setMeta] = useState<PageMeta>({});
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [busy, setBusy] = useState(false);

  const loadDebtors = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    setLocked(false);
    const result = await feature.onSubmit({
      screen: 'khata',
      action: 'load',
      values: {
        page,
        q: query || undefined,
        overdue_only: overdueOnly || undefined,
        sort,
      },
    });
    setLoading(false);
    if (!result.ok) {
      if (isPlanFeatureLocked(result.code)) {
        setLocked(true);
        return;
      }
      setError(errorText(result, 'Unable to load khata.'));
      setRows([]);
      return;
    }
    setRows(listOf(result.customers));
    setKpi((result.kpi as KhataKpi | null) ?? null);
    setAging(result.aging ?? null);
    setMeta(pageMeta(result.meta));
  }, [feature, page, query, overdueOnly, sort]);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    setLocked(false);
    const result = await feature.onSubmit({
      screen: 'khata',
      action: 'loadHistory',
      values: {
        page,
        q: query || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        payment_mode: paymentMode || undefined,
      },
    });
    setLoading(false);
    if (!result.ok) {
      if (isPlanFeatureLocked(result.code)) {
        setLocked(true);
        return;
      }
      setError(errorText(result, 'Unable to load payment history.'));
      setRepayments([]);
      return;
    }
    setRepayments(listOf(result.repayments));
    setMeta(pageMeta(result.meta));
  }, [feature, page, query, fromDate, toDate, paymentMode]);

  useEffect(() => {
    if (tab === 'debtors') {
      void loadDebtors();
      return;
    }
    void loadHistory();
  }, [tab, loadDebtors, loadHistory]);

  async function exportExcel() {
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'khata',
      action: 'exportExcel',
      values: {
        q: query || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        payment_mode: paymentMode || undefined,
      },
    });
    setBusy(false);
    if (!result.ok) {
      if (isPlanFeatureLocked(result.code)) {
        setLocked(true);
        return;
      }
      setError(errorText(result, 'Unable to export khata.'));
    }
  }

  if (locked) {
    return (
      <PlanLock
        testId="khata-plan-lock"
        message={khataLockCopy()}
        viewPlansLabel={KHATA_COPY.viewPlans}
        onViewPlans={() => onNavigate?.('/subscription')}
        isStaff={isStaff}
      />
    );
  }

  return (
    <Stack gap="3">
      <FilterToolbar
        actions={
          <>
            <Button
              type="button"
              variant={tab === 'debtors' ? 'primary' : 'ghost'}
              className={compactBtn}
              onClick={() => {
                setPage(1);
                setTab('debtors');
              }}
            >
              {KHATA_COPY.debtors}
            </Button>
            <Button
              type="button"
              variant={tab === 'payments' ? 'primary' : 'ghost'}
              className={compactBtn}
              onClick={() => {
                setPage(1);
                setTab('payments');
              }}
            >
              {KHATA_COPY.payments}
            </Button>
            {tab === 'payments' ? (
              <Button
                type="button"
                variant="ghost"
                className={compactBtn}
                disabled={busy}
                onClick={() => void exportExcel()}
              >
                {KHATA_COPY.exportExcel}
              </Button>
            ) : null}
          </>
        }
      >
        <FilterField grow>
          <TextField
            label={KHATA_COPY.search}
            name="q"
            value={query}
            onChange={(event) => {
              setPage(1);
              setQuery(event.target.value);
            }}
          />
        </FilterField>
        {tab === 'debtors' ? (
          <>
            <FilterField>
              <SelectField
                label={KHATA_COPY.sort}
                name="sort"
                value={sort}
                onChange={(event) => {
                  setPage(1);
                  setSort(event.target.value);
                }}
              >
                <option value="outstanding_desc">Outstanding high–low</option>
                <option value="outstanding_asc">Outstanding low–high</option>
                <option value="oldest_bill">Oldest bill</option>
              </SelectField>
            </FilterField>
            <FilterField>
              <SelectField
                label={KHATA_COPY.overdueOnly}
                name="overdue_only"
                value={overdueOnly ? 'true' : 'false'}
                onChange={(event) => {
                  setPage(1);
                  setOverdueOnly(event.target.value === 'true');
                }}
              >
                <option value="false">All balances</option>
                <option value="true">Overdue only</option>
              </SelectField>
            </FilterField>
          </>
        ) : (
          <>
            <FilterField>
              <TextField
                label="From date"
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
                label="To date"
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
                label="Payment mode"
                name="payment_mode"
                value={paymentMode}
                onChange={(event) => {
                  setPage(1);
                  setPaymentMode(event.target.value);
                }}
              />
            </FilterField>
          </>
        )}
      </FilterToolbar>
      {tab === 'debtors' && kpi ? (
        <KhataSummaryCards kpi={kpi} aging={aging} />
      ) : null}
      <FormBanner message={error} testId="khata-error" />
      {error ? (
        <Button
          type="button"
          variant="ghost"
          className={compactBtn}
          onClick={() =>
            tab === 'debtors' ? void loadDebtors() : void loadHistory()
          }
        >
          {KHATA_COPY.retry}
        </Button>
      ) : null}
      {loading ? <Spinner size="sm" data-testid="khata-loading" /> : null}
      {tab === 'debtors' && !loading && !error && rows.length === 0 ? (
        <EmptyState icon={BookOpen} testId="khata-empty">
          {KHATA_COPY.empty}
        </EmptyState>
      ) : null}
      {tab === 'payments' && !loading && !error && repayments.length === 0 ? (
        <EmptyState icon={BookOpen} testId="khata-history-empty">
          {KHATA_COPY.historyEmpty}
        </EmptyState>
      ) : null}
      {tab === 'debtors' && rows.length > 0 ? (
        <TableShell id="section-khata">
          <Table aria-label={KHATA_COPY.tableLabel} data-testid="khata-table">
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.customer_id}
                  data-testid={`khata-row-${row.customer_id}`}
                  className="cursor-pointer transition-colors duration-mm"
                  onClick={() => onNavigate?.(`/khata/${row.customer_id}`)}
                >
                  <TableCell className="max-w-[12rem] truncate">
                    {dash(row.name)}
                  </TableCell>
                  <TableCell>{dash(row.phone)}</TableCell>
                  <TableCell className="tabular-nums">
                    {formatInr(row.outstanding)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={
                        row.is_overdue ? KHATA_COPY.overdue : KHATA_COPY.current
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      className={compactBtn}
                      onClick={(event) => {
                        event.stopPropagation();
                        onNavigate?.(`/khata/${row.customer_id}`);
                      }}
                    >
                      {KHATA_COPY.open}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
      ) : null}
      {tab === 'payments' && repayments.length > 0 ? (
        <TableShell id="section-khata-history">
          <Table
            aria-label={KHATA_COPY.historyTableLabel}
            data-testid="khata-history-table"
          >
            <TableHeader>
              <TableRow>
                <TableHead>Receipt</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repayments.map((row, index) => (
                <TableRow
                  key={row.receipt_id ?? `${row.receipt_number}-${index}`}
                >
                  <TableCell>{dash(row.receipt_number)}</TableCell>
                  <TableCell>{formatIstDate(row.date)}</TableCell>
                  <TableCell className="max-w-[12rem] truncate">
                    {dash(row.customer_name)}
                  </TableCell>
                  <TableCell>{dash(row.mode)}</TableCell>
                  <TableCell className="tabular-nums">
                    {formatInr(row.amount)}
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
        previousLabel={KHATA_COPY.previous}
        nextLabel={KHATA_COPY.next}
        pageLabel={KHATA_COPY.page}
        onPage={setPage}
        disabled={loading}
      />
    </Stack>
  );
}

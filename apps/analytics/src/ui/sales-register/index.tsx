import type {
  AnalyticsFeatureData,
  AnalyticsQuery,
  PageMeta,
  SaleRegisterRow,
  SaleRegisterTotals,
} from '@medmate/analytics-contract';
import { formatPaise, isPlanFeatureLocked } from '@medmate/analytics-contract';
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
} from '@medmate/ui';
import { Receipt } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  SHARED_COPY,
  dash,
  errorText,
  formatIstDate,
  listOf,
  pageMeta,
} from '../../lib/copy';
import { EmptyState } from '../shared/empty-state';
import { FormBanner } from '../shared/form-error';
import { Pager } from '../shared/pager';
import { TableShell } from '../shared/section-block';

const compactBtn = 'min-h-10 px-2 text-sm';

export function SalesRegisterScreen({
  feature,
  query,
  onLocked,
}: {
  feature: AnalyticsFeatureData;
  query: AnalyticsQuery;
  onLocked: (message: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<SaleRegisterRow[]>([]);
  const [totals, setTotals] = useState<SaleRegisterTotals | null>(null);
  const [meta, setMeta] = useState<PageMeta>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'analytics',
      action: 'loadSalesRegister',
      values: { ...query, page, limit: 20 },
    });
    setLoading(false);
    if (!result.ok) {
      if (isPlanFeatureLocked(result.code)) {
        onLocked(result.formError ?? '');
        setRows([]);
        return;
      }
      setError(errorText(result, 'Unable to load the sales register.'));
      setRows([]);
      return;
    }
    setRows(listOf(result.salesRegister?.sales));
    setTotals(result.salesRegister?.totals ?? null);
    setMeta(pageMeta(result.meta));
  }, [feature, onLocked, page, query]);

  useEffect(() => {
    void load();
  }, [load]);

  const hasMeta =
    typeof meta.page === 'number' || typeof meta.total === 'number';

  return (
    <Stack gap="3">
      <FormBanner message={error} testId="analytics-sales-error" />
      {error ? (
        <Button
          type="button"
          variant="ghost"
          className={compactBtn}
          onClick={() => void load()}
        >
          {SHARED_COPY.retry}
        </Button>
      ) : null}
      {loading ? (
        <Spinner
          size="sm"
          data-testid="analytics-sales-loading"
          label="Loading sales register"
        />
      ) : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState icon={Receipt} testId="analytics-sales-empty">
          {SHARED_COPY.emptySales}
        </EmptyState>
      ) : null}
      {rows.length > 0 ? (
        <TableShell id="section-sales-register">
          <Table
            aria-label={SHARED_COPY.salesLabel}
            data-testid="analytics-sales-table"
          >
            <TableHeader>
              <TableRow>
                <TableHead className="px-2">Invoice</TableHead>
                <TableHead className="px-2">Date (IST)</TableHead>
                <TableHead className="px-2">Channel</TableHead>
                <TableHead className="px-2">Items</TableHead>
                <TableHead className="px-2">Total</TableHead>
                <TableHead className="px-2">Payment</TableHead>
                <TableHead className="px-2">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.sale_id || row.invoice_number || 'sale'}
                  data-testid={`analytics-sale-${row.sale_id || 'row'}`}
                >
                  <TableCell className="px-2">
                    {dash(row.invoice_number)}
                  </TableCell>
                  <TableCell className="px-2">
                    {formatIstDate(row.sale_date)}
                  </TableCell>
                  <TableCell className="px-2">{dash(row.channel)}</TableCell>
                  <TableCell className="px-2">
                    {dash(row.items_count)}
                  </TableCell>
                  <TableCell className="px-2">
                    {formatPaise(row.total_paise)}
                  </TableCell>
                  <TableCell className="px-2">
                    {dash(row.payment_method)}
                  </TableCell>
                  {/* v8 ignore start */}
                  <TableCell className="px-2">{dash(row.status)}</TableCell>
                  {/* v8 ignore stop */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
      ) : null}
      {totals ? (
        <p data-testid="analytics-sales-totals">
          {dash(totals.total_sales)} sales ·{' '}
          {formatPaise(totals.total_revenue_paise)}
        </p>
      ) : null}
      {hasMeta ? (
        <Pager
          page={meta.page ?? page}
          hasNext={Boolean(meta.has_next)}
          previousLabel={SHARED_COPY.previous}
          nextLabel={SHARED_COPY.next}
          pageLabel={SHARED_COPY.page}
          onPage={setPage}
          disabled={loading}
        />
      ) : null}
    </Stack>
  );
}

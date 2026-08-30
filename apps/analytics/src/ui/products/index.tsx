import type {
  AnalyticsFeatureData,
  AnalyticsQuery,
  PageMeta,
  ProductAnalyticsRow,
} from '@medmate/analytics-contract';
import {
  formatPaise,
  formatPct,
  isPlanFeatureLocked,
} from '@medmate/analytics-contract';
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
import { Package } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { SHARED_COPY, dash, errorText, listOf, pageMeta } from '../../lib/copy';
import { EmptyState } from '../shared/empty-state';
import { FilterField, FilterToolbar } from '../shared/filter-toolbar';
import { FormBanner } from '../shared/form-error';
import { Pager } from '../shared/pager';
import { TableShell } from '../shared/section-block';
import { SelectField } from '../shared/select-field';

const compactBtn = 'min-h-10 px-2 text-sm';

export function ProductsScreen({
  feature,
  query,
  onLocked,
}: {
  feature: AnalyticsFeatureData;
  query: AnalyticsQuery;
  onLocked: (message: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('revenue');
  const [deadOnly, setDeadOnly] = useState(false);
  const [rows, setRows] = useState<ProductAnalyticsRow[]>([]);
  const [meta, setMeta] = useState<PageMeta>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'analytics',
      action: 'loadProducts',
      values: {
        ...query,
        page,
        limit: 20,
        sort,
        order: 'desc',
        dead_stock_only: deadOnly || undefined,
      },
    });
    setLoading(false);
    if (!result.ok) {
      if (isPlanFeatureLocked(result.code)) {
        onLocked(result.formError ?? '');
        setRows([]);
        return;
      }
      setError(errorText(result, 'Unable to load product analytics.'));
      setRows([]);
      return;
    }
    setRows(listOf(result.products?.products));
    setMeta(pageMeta(result.meta));
  }, [deadOnly, feature, onLocked, page, query, sort]);

  useEffect(() => {
    void load();
  }, [load]);

  const hasMeta =
    typeof meta.page === 'number' || typeof meta.total === 'number';

  return (
    <Stack gap="3">
      <FilterToolbar>
        <FilterField>
          <SelectField
            label="Sort"
            name="sort"
            value={sort}
            onChange={(event) => {
              setPage(1);
              setSort(event.target.value);
            }}
          >
            <option value="revenue">Revenue</option>
            <option value="units_sold">Units sold</option>
            <option value="margin_pct">Margin</option>
            <option value="profit">Profit</option>
          </SelectField>
        </FilterField>
        <FilterField>
          <SelectField
            label="Stock"
            name="dead_stock_only"
            value={deadOnly ? 'dead' : 'all'}
            onChange={(event) => {
              setPage(1);
              setDeadOnly(event.target.value === 'dead');
            }}
          >
            <option value="all">All products</option>
            <option value="dead">Dead stock only</option>
          </SelectField>
        </FilterField>
      </FilterToolbar>
      <FormBanner message={error} testId="analytics-products-error" />
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
          data-testid="analytics-products-loading"
          label="Loading products"
        />
      ) : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState icon={Package} testId="analytics-products-empty">
          {SHARED_COPY.emptyProducts}
        </EmptyState>
      ) : null}
      {rows.length > 0 ? (
        <TableShell id="section-products">
          <Table
            aria-label="Product analytics"
            data-testid="analytics-products-table"
          >
            <TableHeader>
              <TableRow>
                <TableHead className="px-2">Product</TableHead>
                <TableHead className="px-2">Units</TableHead>
                <TableHead className="px-2">Revenue</TableHead>
                <TableHead className="px-2">Margin</TableHead>
                <TableHead className="px-2">Stock</TableHead>
                <TableHead className="px-2">Dead stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.product_id ?? row.name ?? 'product'}
                  data-testid={`analytics-product-${row.product_id ?? 'row'}`}
                >
                  <TableCell className="px-2">{dash(row.name)}</TableCell>
                  <TableCell className="px-2">{dash(row.units_sold)}</TableCell>
                  <TableCell className="px-2">
                    {formatPaise(row.revenue_paise)}
                  </TableCell>
                  <TableCell className="px-2">
                    {formatPct(row.margin_pct)}
                  </TableCell>
                  <TableCell className="px-2">
                    {dash(row.stock_remaining)}
                  </TableCell>
                  <TableCell className="px-2">
                    {row.dead_stock_flag ? 'Yes' : 'No'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
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

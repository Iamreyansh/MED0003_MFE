import type {
  OrderInboxRow,
  OrdersFeatureData,
  PageMeta,
} from '@medmate/orders-contract';
import {
  Button,
  Flex,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@medmate/ui';
import { Inbox } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  HOME_COPY,
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
import { TableShell } from '../shared/section-block';
import { SelectField } from '../shared/select-field';
import { StatusBadge } from '../shared/status-badge';

const STATUSES = [
  '',
  'PENDING_ACCEPTANCE',
  'ACCEPTED',
  'PACKING',
  'READY_FOR_PICKUP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
] as const;

export function OrdersHomeScreen({
  feature,
  onOpenOrder,
}: {
  feature: OrdersFeatureData;
  onOpenOrder?: (orderId: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [rows, setRows] = useState<OrderInboxRow[]>([]);
  const [meta, setMeta] = useState<PageMeta>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'orders-home',
      action: 'load',
      values: { page, limit: 20, status: status || undefined },
    });
    setLoading(false);
    if (!result.ok) {
      setError(errorText(result, 'Unable to load orders.'));
      return;
    }
    setRows(listOf(result.orders));
    setMeta(pageMeta(result.meta));
  }, [feature, page, status]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <Spinner data-testid="orders-home-loading" aria-label="Loading orders" />
    );
  }

  return (
    <>
      <FormBanner message={error} testId="orders-home-error" />
      <FilterToolbar>
        <FilterField>
          <SelectField
            label={HOME_COPY.status}
            name="status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">{HOME_COPY.allStatuses}</option>
            {STATUSES.filter(Boolean).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </SelectField>
        </FilterField>
        <Button type="button" variant="ghost" onClick={() => void load()}>
          {HOME_COPY.retry}
        </Button>
      </FilterToolbar>
      {rows.length === 0 ? (
        <EmptyState icon={Inbox} testId="orders-home-empty">
          {HOME_COPY.empty}
        </EmptyState>
      ) : (
        <TableShell id="orders-home-table">
          <Table
            aria-label={HOME_COPY.tableLabel}
            data-testid="orders-home-table"
          >
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.order_id}>
                  <TableCell>
                    {dash(row.order_number ?? row.order_id)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell>{dash(row.items_count)}</TableCell>
                  <TableCell>{dash(row.total)}</TableCell>
                  <TableCell>{formatIstDate(row.created_at)}</TableCell>
                  <TableCell>
                    <Flex justify="end">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenOrder?.(row.order_id)}
                      >
                        {HOME_COPY.open}
                      </Button>
                    </Flex>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pager
            page={page}
            hasNext={Boolean(meta.has_next)}
            previousLabel={HOME_COPY.previous}
            nextLabel={HOME_COPY.next}
            pageLabel={HOME_COPY.page}
            onPage={setPage}
            disabled={loading}
          />
        </TableShell>
      )}
    </>
  );
}

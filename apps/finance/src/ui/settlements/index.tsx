import type {
  FinanceFeatureData,
  PageMeta,
  SettlementListRow,
} from '@medmate/finance-contract';
import { formatInr } from '@medmate/finance-contract';
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
import { Landmark } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  LIST_COPY,
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
import { StatusBadge } from '../shared/status-badge';

const compactBtn = 'min-h-10 px-2 text-sm';

export function SettlementsScreen({
  feature,
  onNavigate,
}: {
  feature: FinanceFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<SettlementListRow[]>([]);
  const [meta, setMeta] = useState<PageMeta>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'settlements',
      action: 'load',
      values: { page, limit: 20 },
    });
    setLoading(false);
    if (!result.ok) {
      setError(errorText(result, 'Unable to load settlements.'));
      setRows([]);
      return;
    }
    setRows(listOf(result.settlements));
    setMeta(pageMeta(result.meta));
  }, [feature, page]);

  useEffect(() => {
    void load();
  }, [load]);

  function openSettlement(row: SettlementListRow) {
    onNavigate?.(`/finance/settlements/${row.settlement_id}`);
  }

  return (
    <Stack gap="3">
      <FormBanner message={error} testId="settlements-error" />
      {error ? (
        <Button
          type="button"
          variant="ghost"
          className={compactBtn}
          onClick={() => void load()}
        >
          {LIST_COPY.retry}
        </Button>
      ) : null}
      {loading ? (
        <Spinner
          size="sm"
          data-testid="settlements-loading"
          label="Loading settlements"
        />
      ) : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState icon={Landmark} testId="settlements-empty">
          {LIST_COPY.empty}
        </EmptyState>
      ) : null}
      {rows.length > 0 ? (
        <TableShell id="section-settlements">
          <Table
            aria-label={LIST_COPY.tableLabel}
            data-testid="settlements-table"
          >
            <TableHeader>
              <TableRow>
                <TableHead className="px-2">Settlement</TableHead>
                <TableHead className="px-2">Cycle</TableHead>
                <TableHead className="px-2">Net payable</TableHead>
                <TableHead className="px-2">Status</TableHead>
                <TableHead className="px-2">Released</TableHead>
                <TableHead className="px-2">Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.settlement_id}
                  data-testid={`settlement-row-${row.settlement_id}`}
                  className="cursor-pointer"
                  onClick={() => openSettlement(row)}
                >
                  <TableCell className="px-2 font-medium">
                    {dash(row.settlement_id)}
                  </TableCell>
                  <TableCell className="px-2">
                    {formatIstDate(row.cycle_from)} –{' '}
                    {formatIstDate(row.cycle_to)}
                  </TableCell>
                  <TableCell className="px-2 tabular-nums">
                    {formatInr(row.net_payable)}
                  </TableCell>
                  <TableCell className="px-2">
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="px-2">
                    {formatIstDate(row.released_at)}
                  </TableCell>
                  <TableCell className="px-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className={compactBtn}
                      onClick={(event) => {
                        event.stopPropagation();
                        openSettlement(row);
                      }}
                    >
                      {LIST_COPY.open}
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
        previousLabel={LIST_COPY.previous}
        nextLabel={LIST_COPY.next}
        pageLabel={LIST_COPY.page}
        onPage={setPage}
        disabled={loading}
      />
    </Stack>
  );
}

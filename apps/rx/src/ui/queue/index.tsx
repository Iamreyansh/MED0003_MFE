import type { PageMeta, RxFeatureData, RxQueueRow } from '@medmate/rx-contract';
import {
  RX_STATUS_FILTERS,
  isPlanFeatureLocked,
  rxLockCopy,
} from '@medmate/rx-contract';
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
import { ClipboardList } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  QUEUE_COPY,
  errorText,
  formatIstDate,
  listOf,
  pageMeta,
  yesNo,
} from '../../lib/copy';
import { EmptyState } from '../shared/empty-state';
import { FilterField, FilterToolbar } from '../shared/filter-toolbar';
import { FormBanner } from '../shared/form-error';
import { Pager } from '../shared/pager';
import { PlanLock } from '../shared/plan-lock';
import { TableShell } from '../shared/section-block';
import { SelectField } from '../shared/select-field';
import { StatusBadge } from '../shared/status-badge';

const compactBtn = 'min-h-10 px-2 text-sm';

export function QueueScreen({
  feature,
  onNavigate,
}: {
  feature: RxFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const isStaff = feature.role === 'pharmacy_staff';
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('PENDING_REVIEW');
  const [rows, setRows] = useState<RxQueueRow[]>([]);
  const [meta, setMeta] = useState<PageMeta>({});
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | undefined>(feature.formError);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    setLocked(false);
    const result = await feature.onSubmit({
      screen: 'queue',
      action: 'load',
      values: { page, limit: 20, status: status || undefined },
    });
    setLoading(false);
    if (!result.ok) {
      if (isPlanFeatureLocked(result.code)) {
        setLocked(true);
        setError(result.formError ?? rxLockCopy());
        setRows([]);
        return;
      }
      setError(errorText(result, 'Unable to load prescriptions.'));
      return;
    }
    setRows(listOf(result.prescriptions));
    setMeta(pageMeta(result.meta));
  }, [feature, page, status]);

  useEffect(() => {
    void load();
  }, [load]);

  if (locked) {
    return (
      <PlanLock
        testId="rx-queue-plan-lock"
        message={error || rxLockCopy()}
        viewPlansLabel={QUEUE_COPY.viewPlans}
        onViewPlans={() => onNavigate?.('/subscription')}
        isStaff={isStaff}
      />
    );
  }

  return (
    <Stack gap="3">
      <FilterToolbar>
        <FilterField>
          <SelectField
            label={QUEUE_COPY.status}
            name="status"
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
          >
            {RX_STATUS_FILTERS.map((value) => (
              <option key={value || 'all'} value={value}>
                {value || QUEUE_COPY.allStatuses}
              </option>
            ))}
          </SelectField>
        </FilterField>
      </FilterToolbar>
      <FormBanner message={error} testId="rx-queue-error" />
      {error ? (
        <Button
          type="button"
          variant="ghost"
          className={compactBtn}
          onClick={() => void load()}
        >
          {QUEUE_COPY.retry}
        </Button>
      ) : null}
      {loading ? <Spinner size="sm" data-testid="rx-queue-loading" /> : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState icon={ClipboardList} testId="rx-queue-empty">
          {QUEUE_COPY.empty}
        </EmptyState>
      ) : null}
      {rows.length > 0 ? (
        <TableShell id="section-rx-queue">
          <Table
            aria-label={QUEUE_COPY.tableLabel}
            data-testid="rx-queue-table"
          >
            <TableHeader>
              <TableRow>
                <TableHead>Prescription</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>{QUEUE_COPY.scheduleH1}</TableHead>
                <TableHead>{QUEUE_COPY.scheduleX}</TableHead>
                <TableHead>Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.rx_id}
                  data-testid={`rx-row-${row.rx_id}`}
                  className="cursor-pointer transition-colors duration-mm"
                  onClick={() => onNavigate?.(`/prescriptions/${row.rx_id}`)}
                >
                  <TableCell>{row.rx_id}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell>{formatIstDate(row.created_at)}</TableCell>
                  <TableCell>{yesNo(row.schedule_h1)}</TableCell>
                  <TableCell>{yesNo(row.schedule_x)}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      className={compactBtn}
                      onClick={(event) => {
                        event.stopPropagation();
                        onNavigate?.(`/prescriptions/${row.rx_id}`);
                      }}
                    >
                      {QUEUE_COPY.open}
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
        previousLabel={QUEUE_COPY.previous}
        nextLabel={QUEUE_COPY.next}
        pageLabel={QUEUE_COPY.page}
        onPage={setPage}
        disabled={loading}
      />
    </Stack>
  );
}

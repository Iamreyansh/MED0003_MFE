import type {
  DrugRegisterRow,
  PageMeta,
  RetentionRules,
  RxFeatureData,
} from '@medmate/rx-contract';
import { DRUG_REGISTER_SCHEDULE_FILTERS } from '@medmate/rx-contract';
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
  Text,
  TextField,
} from '@medmate/ui';
import { BookOpen } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  REGISTER_COPY,
  dash,
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
import { SectionBlock, TableShell } from '../shared/section-block';
import { SelectField } from '../shared/select-field';

const compactBtn = 'min-h-10 px-2 text-sm';

export function DrugRegisterScreen({ feature }: { feature: RxFeatureData }) {
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [schedule, setSchedule] = useState('');
  const [rows, setRows] = useState<DrugRegisterRow[]>([]);
  const [meta, setMeta] = useState<PageMeta>({});
  const [retention, setRetention] = useState<RetentionRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'drug-register',
      action: 'load',
      values: {
        page,
        limit: 20,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        schedule: schedule || undefined,
      },
    });
    setLoading(false);
    if (!result.ok) {
      setError(errorText(result, 'Unable to load the drug register.'));
      return;
    }
    setRows(listOf(result.register));
    setMeta(pageMeta(result.meta));
  }, [feature, fromDate, page, schedule, toDate]);

  const loadRetention = useCallback(async () => {
    if (!feature.canViewRetention) {
      setRetention(null);
      return;
    }
    const result = await feature.onSubmit({
      screen: 'drug-register',
      action: 'loadRetention',
    });
    if (result.ok) {
      setRetention(result.retention ?? null);
    }
  }, [feature]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadRetention();
  }, [loadRetention]);

  return (
    <Stack gap="3">
      <FilterToolbar>
        <FilterField>
          <TextField
            label={REGISTER_COPY.fromDate}
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
            label={REGISTER_COPY.toDate}
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
          <SelectField
            label={REGISTER_COPY.schedule}
            name="schedule"
            value={schedule}
            onChange={(event) => {
              setPage(1);
              setSchedule(event.target.value);
            }}
          >
            {DRUG_REGISTER_SCHEDULE_FILTERS.map((value) => (
              <option key={value || 'all'} value={value}>
                {value || REGISTER_COPY.allSchedules}
              </option>
            ))}
          </SelectField>
        </FilterField>
      </FilterToolbar>
      {feature.canViewRetention && retention?.guidance ? (
        <SectionBlock
          id="section-retention"
          title={REGISTER_COPY.retention}
          hint={REGISTER_COPY.retentionHint}
        >
          <Text size="sm" data-testid="rx-retention-guidance">
            {retention.guidance}
          </Text>
        </SectionBlock>
      ) : null}
      <FormBanner message={error} testId="rx-register-error" />
      {error ? (
        <Button
          type="button"
          variant="ghost"
          className={compactBtn}
          onClick={() => void load()}
        >
          {REGISTER_COPY.retry}
        </Button>
      ) : null}
      {loading ? <Spinner size="sm" data-testid="rx-register-loading" /> : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState icon={BookOpen} testId="rx-register-empty">
          {REGISTER_COPY.empty}
        </EmptyState>
      ) : null}
      {rows.length > 0 ? (
        <TableShell id="section-drug-register">
          <Table
            aria-label={REGISTER_COPY.tableLabel}
            data-testid="rx-register-table"
          >
            <TableHeader>
              <TableRow>
                <TableHead>Dispensed</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>H1</TableHead>
                <TableHead>X</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={row.entry_id ?? `${index}`}>
                  <TableCell>{formatIstDate(row.dispensed_at)}</TableCell>
                  <TableCell>{dash(row.product_name)}</TableCell>
                  <TableCell>{dash(row.schedule)}</TableCell>
                  <TableCell className="tabular-nums">
                    {dash(row.quantity)}
                  </TableCell>
                  <TableCell>{yesNo(row.schedule_h1)}</TableCell>
                  <TableCell>{yesNo(row.schedule_x)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
      ) : null}
      <Pager
        page={page}
        hasNext={Boolean(meta.has_next)}
        previousLabel={REGISTER_COPY.previous}
        nextLabel={REGISTER_COPY.next}
        pageLabel={REGISTER_COPY.page}
        onPage={setPage}
        disabled={loading}
      />
    </Stack>
  );
}

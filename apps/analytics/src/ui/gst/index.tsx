import type {
  AccountsGstData,
  AnalyticsFeatureData,
  AnalyticsQuery,
} from '@medmate/analytics-contract';
import {
  formatPaise,
  isForbidden,
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
  Text,
} from '@medmate/ui';
import { Landmark } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  SHARED_COPY,
  dash,
  errorText,
  formatIstDate,
  listOf,
} from '../../lib/copy';
import { EmptyState } from '../shared/empty-state';
import { FormBanner } from '../shared/form-error';
import { SectionBlock, TableShell } from '../shared/section-block';

const compactBtn = 'min-h-10 px-2 text-sm';

export function GstScreen({
  feature,
  query,
  onLocked,
}: {
  feature: AnalyticsFeatureData;
  query: AnalyticsQuery;
  onLocked: (message: string) => void;
}) {
  const [gst, setGst] = useState<AccountsGstData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'analytics',
      action: 'loadGst',
      values: query,
    });
    setLoading(false);
    if (!result.ok) {
      if (isPlanFeatureLocked(result.code)) {
        onLocked(result.formError ?? '');
        setGst(null);
        return;
      }
      setError(
        isForbidden(result.code)
          ? SHARED_COPY.forbidden
          : errorText(result, 'Unable to load GST accounts.'),
      );
      setGst(null);
      return;
    }
    setGst(result.gst ?? null);
  }, [feature, onLocked, query]);

  useEffect(() => {
    void load();
  }, [load]);

  const pl = gst?.pl_card;
  const liability = gst?.gst_liability;
  const slabs = listOf(liability?.slab_breakdown);
  const dayBook = listOf(gst?.day_book);
  const empty =
    !loading && !error && !pl && slabs.length === 0 && dayBook.length === 0;

  return (
    <Stack gap="3">
      <FormBanner message={error} testId="analytics-gst-error" />
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
          data-testid="analytics-gst-loading"
          label="Loading GST accounts"
        />
      ) : null}
      {empty ? (
        <EmptyState icon={Landmark} testId="analytics-gst-empty">
          {SHARED_COPY.emptyGst}
        </EmptyState>
      ) : null}
      {pl ? (
        <SectionBlock
          id="section-gst-pl"
          title="P&L"
          hint="Working papers only. This does not file GST."
        >
          <dl
            className="grid gap-3 sm:grid-cols-2"
            data-testid="analytics-gst-pl"
          >
            <div>
              <Text size="sm" tone="muted">
                Revenue
              </Text>
              <Text>{formatPaise(pl.revenue_paise)}</Text>
            </div>
            <div>
              <Text size="sm" tone="muted">
                COGS
              </Text>
              <Text>{formatPaise(pl.cogs_paise)}</Text>
            </div>
            <div>
              <Text size="sm" tone="muted">
                Gross profit
              </Text>
              <Text>{formatPaise(pl.gross_profit_paise)}</Text>
            </div>
            <div>
              <Text size="sm" tone="muted">
                Net profit
              </Text>
              <Text>{formatPaise(pl.net_profit_paise)}</Text>
            </div>
          </dl>
        </SectionBlock>
      ) : null}
      {slabs.length > 0 ? (
        <TableShell id="section-gst-slabs">
          <Table aria-label="GST slabs" data-testid="analytics-gst-slabs">
            <TableHeader>
              <TableRow>
                <TableHead className="px-2">Slab</TableHead>
                <TableHead className="px-2">Taxable</TableHead>
                <TableHead className="px-2">Output GST</TableHead>
                <TableHead className="px-2">ITC</TableHead>
                <TableHead className="px-2">Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slabs.map((row) => (
                <TableRow key={String(row.slab_pct)}>
                  <TableCell className="px-2">{dash(row.slab_pct)}%</TableCell>
                  <TableCell className="px-2">
                    {formatPaise(row.taxable_value_paise)}
                  </TableCell>
                  <TableCell className="px-2">
                    {formatPaise(row.output_gst_paise)}
                  </TableCell>
                  <TableCell className="px-2">
                    {formatPaise(row.input_itc_paise)}
                  </TableCell>
                  <TableCell className="px-2">
                    {formatPaise(row.net_paise)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
      ) : null}
      {dayBook.length > 0 ? (
        <TableShell id="section-gst-daybook">
          <Table aria-label="Day book" data-testid="analytics-gst-daybook">
            <TableHeader>
              <TableRow>
                <TableHead className="px-2">Date</TableHead>
                <TableHead className="px-2">Type</TableHead>
                <TableHead className="px-2">Reference</TableHead>
                <TableHead className="px-2">Debit</TableHead>
                <TableHead className="px-2">Credit</TableHead>
                <TableHead className="px-2">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dayBook.map((row, index) => (
                <TableRow key={`${row.reference ?? 'row'}-${index}`}>
                  <TableCell className="px-2">
                    {formatIstDate(row.date)}
                  </TableCell>
                  <TableCell className="px-2">{dash(row.type)}</TableCell>
                  <TableCell className="px-2">{dash(row.reference)}</TableCell>
                  <TableCell className="px-2">
                    {formatPaise(row.debit_paise)}
                  </TableCell>
                  <TableCell className="px-2">
                    {formatPaise(row.credit_paise)}
                  </TableCell>
                  <TableCell className="px-2">
                    {formatPaise(row.balance_paise)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
      ) : null}
    </Stack>
  );
}

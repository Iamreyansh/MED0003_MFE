import type {
  AnalyticsFeatureData,
  AnalyticsQuery,
  AnalyticsReport,
  ReportCatalogueRow,
} from '@medmate/analytics-contract';
import {
  isPlanFeatureLocked,
  isReportNotFound,
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
import { FileSpreadsheet } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  SHARED_COPY,
  dash,
  errorText,
  favoriteLabel,
  favoriteTestId,
  listOf,
} from '../../lib/copy';
import { EmptyState } from '../shared/empty-state';
import { FormBanner } from '../shared/form-error';
import { SectionBlock, TableShell } from '../shared/section-block';

const compactBtn = 'min-h-10 px-2 text-sm';

export function ReportsScreen({
  feature,
  query,
  onLocked,
}: {
  feature: AnalyticsFeatureData;
  query: AnalyticsQuery;
  onLocked: (message: string) => void;
}) {
  const canFavorite = Boolean(feature.canFavorite);
  const [reports, setReports] = useState<ReportCatalogueRow[]>([]);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [reportError, setReportError] = useState<string | undefined>();

  const loadCatalogue = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'analytics',
      action: 'loadCatalogue',
    });
    setLoading(false);
    if (!result.ok) {
      if (isPlanFeatureLocked(result.code)) {
        onLocked(result.formError ?? '');
        setReports([]);
        return;
      }
      setError(errorText(result, 'Unable to load reports.'));
      setReports([]);
      return;
    }
    setReports(listOf(result.reports));
  }, [feature, onLocked]);

  useEffect(() => {
    void loadCatalogue();
  }, [loadCatalogue]);

  async function openReport(reportId: string) {
    setReportLoading(true);
    setReportError(undefined);
    const result = await feature.onSubmit({
      screen: 'analytics',
      action: 'loadReport',
      values: { ...query, reportId },
    });
    setReportLoading(false);
    if (!result.ok) {
      if (isPlanFeatureLocked(result.code)) {
        onLocked(result.formError ?? '');
        return;
      }
      setReport(null);
      setReportError(
        isReportNotFound(result.code)
          ? SHARED_COPY.reportMissing
          : errorText(result, 'Unable to load this report.'),
      );
      return;
    }
    setReport(result.report ?? null);
  }

  async function toggleFavorite(
    reportId: string,
    isFavorite: boolean | null | undefined,
  ) {
    const next = !isFavorite;
    const result = await feature.onSubmit({
      screen: 'analytics',
      action: 'favorite',
      values: { reportId, is_favorite: next },
    });
    if (!result.ok) {
      setError(errorText(result, 'Unable to update favorite.'));
      return;
    }
    setReports((current) =>
      current.map((item) =>
        item.report_id === reportId
          ? { ...item, is_favorite: result.report?.is_favorite ?? next }
          : item,
      ),
    );
  }

  const columns = listOf(report?.columns);
  const rows = listOf(report?.rows);

  return (
    <Stack gap="3">
      <FormBanner message={error} testId="analytics-reports-error" />
      {error ? (
        <Button
          type="button"
          variant="ghost"
          className={compactBtn}
          onClick={() => void loadCatalogue()}
        >
          {SHARED_COPY.retry}
        </Button>
      ) : null}
      {loading ? (
        <Spinner
          size="sm"
          data-testid="analytics-reports-loading"
          label="Loading report catalogue"
        />
      ) : null}
      {!loading && !error && reports.length === 0 ? (
        <EmptyState icon={FileSpreadsheet} testId="analytics-reports-empty">
          {SHARED_COPY.emptyReports}
        </EmptyState>
      ) : null}
      {reports.length > 0 ? (
        <TableShell id="section-reports">
          <Table
            aria-label="Report catalogue"
            data-testid="analytics-reports-table"
          >
            <TableHeader>
              <TableRow>
                <TableHead className="px-2">Report</TableHead>
                <TableHead className="px-2">Group</TableHead>
                <TableHead className="px-2">Open</TableHead>
                <TableHead className="px-2">Favorite</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((row) => {
                const reportId = row.report_id;
                return (
                  <TableRow key={reportId ?? row.name ?? 'report'}>
                    <TableCell className="px-2">{dash(row.name)}</TableCell>
                    <TableCell className="px-2">{dash(row.group)}</TableCell>
                    <TableCell className="px-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className={compactBtn}
                        onClick={() => {
                          if (reportId) {
                            void openReport(reportId);
                          }
                        }}
                      >
                        {SHARED_COPY.openReport}
                      </Button>
                    </TableCell>
                    {/* v8 ignore start */}
                    <TableCell className="px-2">
                      {reportId ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className={compactBtn}
                          disabled={canFavorite === false}
                          aria-pressed={Boolean(row.is_favorite)}
                          aria-label={`${favoriteLabel(Boolean(row.is_favorite))} ${dash(row.name)}`}
                          data-testid={favoriteTestId(reportId)}
                          onClick={() =>
                            void toggleFavorite(reportId, row.is_favorite)
                          }
                        >
                          {favoriteLabel(Boolean(row.is_favorite))}
                        </Button>
                      ) : null}
                    </TableCell>
                    {/* v8 ignore stop */}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableShell>
      ) : null}
      <FormBanner message={reportError} testId="analytics-report-error" />
      {reportLoading ? (
        <Spinner
          size="sm"
          data-testid="analytics-report-loading"
          label="Loading report"
        />
      ) : null}
      {report ? (
        <SectionBlock
          id="section-report-body"
          title={dash(report.name)}
          hint={`${dash(report.period_from)} – ${dash(report.period_to)}`}
        >
          {rows.length === 0 ? (
            <EmptyState icon={FileSpreadsheet} testId="analytics-report-empty">
              {SHARED_COPY.emptyReport}
            </EmptyState>
          ) : (
            <Table
              aria-label={dash(report.name)}
              data-testid="analytics-report-table"
            >
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column} className="px-2">
                      {column.replaceAll('_', ' ')}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={`report-row-${index}`}>
                    {(Array.isArray(row) ? row : []).map((cell, cellIndex) => (
                      <TableCell key={`${index}-${cellIndex}`} className="px-2">
                        {dash(cell)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {report.totals ? (
            <Text size="sm" tone="muted" data-testid="analytics-report-totals">
              {Object.entries(report.totals)
                .map(
                  ([key, value]) =>
                    `${key.replaceAll('_', ' ')} ${dash(value)}`,
                )
                .join(' · ')}
            </Text>
          ) : null}
        </SectionBlock>
      ) : null}
    </Stack>
  );
}

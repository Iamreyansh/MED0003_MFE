import type {
  ExpiryAlert,
  InventoryFeatureData,
} from '@medmate/inventory-contract';
import { formatIstDate, productDisplayName } from '@medmate/inventory-contract';
import {
  Badge,
  Button,
  Flex,
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
import { CalendarClock, FileSpreadsheet } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { daysUntilLabel, EXPIRY_COPY } from '../../lib/copy';
import { daysUntilExpiry } from '../../lib/expiry';
import { EmptyState } from '../shared/empty-state';
import { FormBanner } from '../shared/form-error';
import { SectionBlock } from '../shared/section-block';

export function ExpiryScreen({
  feature,
  onNavigate,
}: {
  feature: InventoryFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const canReport = Boolean(
    feature.canWriteOff || feature.role === 'pharmacy_owner',
  );
  const [alerts, setAlerts] = useState<ExpiryAlert[]>([]);
  const [report, setReport] = useState<ExpiryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    const alertsResult = await feature.onSubmit({
      screen: 'expiry',
      action: 'loadAlerts',
    });
    if (!alertsResult.ok) {
      setLoading(false);
      setError(
        alertsResult.formError ??
          alertsResult.code ??
          'Unable to load expiry alerts.',
      );
      setAlerts([]);
      return;
    }
    setAlerts(alertsResult.alerts ?? []);
    if (canReport) {
      const reportResult = await feature.onSubmit({
        screen: 'expiry',
        action: 'loadReport',
      });
      if (reportResult.ok) {
        setReport(reportResult.report ?? []);
      }
    }
    setLoading(false);
  }, [canReport, feature]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Stack gap="4">
      <FormBanner message={error} testId="expiry-error" />
      {error ? (
        <Button type="button" variant="ghost" onClick={() => void load()}>
          {EXPIRY_COPY.retry}
        </Button>
      ) : null}
      {loading ? <Spinner data-testid="expiry-loading" /> : null}
      {!loading && !error && alerts.length === 0 ? (
        <EmptyState icon={CalendarClock} testId="expiry-empty">
          {EXPIRY_COPY.empty}
        </EmptyState>
      ) : null}
      {alerts.length > 0 ? (
        <SectionBlock
          id="section-expiry-alerts"
          title={EXPIRY_COPY.alerts}
          hint={EXPIRY_COPY.alertsHint}
          icon={CalendarClock}
        >
          <Table
            aria-label={EXPIRY_COPY.tableLabel}
            data-testid="expiry-alerts"
          >
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((row) => {
                const days = daysUntilExpiry(row.expiry_date);
                return (
                  <TableRow
                    key={`${row.product_id}-${row.batch_id ?? row.expiry_date}`}
                    data-testid={`expiry-alert-${row.product_id}`}
                  >
                    <TableCell>{productDisplayName(row)}</TableCell>
                    <TableCell>
                      <Flex align="center" gap="2" wrap>
                        <Text as="span" className="tabular-nums">
                          {formatIstDate(row.expiry_date)}
                        </Text>
                        <Badge
                          tone={
                            days !== null && days <= 30 ? 'primary' : 'default'
                          }
                        >
                          {daysUntilLabel(days)}
                        </Badge>
                      </Flex>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {row.quantity ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          onNavigate?.(`/inventory/${row.product_id}`)
                        }
                      >
                        Open product
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </SectionBlock>
      ) : null}
      {canReport ? (
        <SectionBlock
          id="section-expiry-report"
          title={EXPIRY_COPY.report}
          hint={EXPIRY_COPY.reportHint}
          icon={FileSpreadsheet}
          footer={
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                void feature.onSubmit({
                  screen: 'expiry',
                  action: 'exportReport',
                });
              }}
            >
              {EXPIRY_COPY.export}
            </Button>
          }
        >
          <Stack gap="3" data-testid="expiry-report">
            {report.length > 0 ? (
              <Table aria-label={EXPIRY_COPY.reportLabel}>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.map((row) => (
                    <TableRow key={`${row.product_id}-${row.batch_id ?? 'r'}`}>
                      <TableCell>{productDisplayName(row)}</TableCell>
                      <TableCell className="tabular-nums">
                        {formatIstDate(row.expiry_date)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {row.quantity ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </Stack>
        </SectionBlock>
      ) : null}
    </Stack>
  );
}

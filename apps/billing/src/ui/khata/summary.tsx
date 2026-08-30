import type { KhataAging, KhataKpi } from '@medmate/billing-contract';
import { formatInr } from '@medmate/billing-contract';
import { Box, Grid, Text } from '@medmate/ui';
import { KHATA_COPY } from '../../lib/copy';

type SummaryItem = {
  testId: string;
  label: string;
  value: string;
};

export function KhataSummaryCards({
  kpi,
  aging,
}: {
  kpi: KhataKpi;
  aging?: KhataAging | null;
}) {
  const items: SummaryItem[] = [
    {
      testId: 'khata-kpi-outstanding',
      label: KHATA_COPY.kpiOutstanding,
      value: formatInr(kpi.total_outstanding ?? 0),
    },
    {
      testId: 'khata-kpi-overdue',
      label: KHATA_COPY.kpiOverdue,
      value: formatInr(kpi.overdue_30d ?? 0),
    },
    {
      testId: 'khata-kpi-collected',
      label: KHATA_COPY.kpiCollected,
      value: formatInr(kpi.collected_this_month ?? 0),
    },
    {
      testId: 'khata-kpi-rate',
      label: KHATA_COPY.kpiRate,
      value:
        typeof kpi.collection_rate_pct === 'number'
          ? `${kpi.collection_rate_pct}%`
          : '—',
    },
  ];

  return (
    <Grid
      cols="4"
      gap="0"
      data-testid="khata-summary"
      className="overflow-hidden rounded-mm border border-mm-border bg-mm-surface"
    >
      {items.map((item) => (
        <Box
          key={item.testId}
          data-testid={item.testId}
          className="min-w-0 border-mm-border px-3 py-2 first:border-l-0 border-l"
        >
          <Text className="font-mm-heading text-mm-title font-semibold leading-none tabular-nums">
            {item.value}
          </Text>
          <Text size="sm" tone="muted" className="mt-1">
            {item.label}
          </Text>
        </Box>
      ))}
      {aging ? (
        <Box
          data-testid="khata-aging"
          className="col-span-4 border-t border-mm-border px-3 py-2"
        >
          <Text size="sm" tone="muted">
            {KHATA_COPY.agingCurrent} {formatInr(aging.current_0_30d ?? 0)} ·{' '}
            {KHATA_COPY.agingMid} {formatInr(aging.overdue_31_60d ?? 0)} ·{' '}
            {KHATA_COPY.agingOld} {formatInr(aging.overdue_60d_plus ?? 0)}
          </Text>
        </Box>
      ) : null}
    </Grid>
  );
}

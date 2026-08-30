import type { SalesSummary } from '@medmate/billing-contract';
import { formatInr } from '@medmate/billing-contract';
import { Box, Grid, Text } from '@medmate/ui';
import { SALES_COPY } from '../../lib/copy';

type SummaryItem = {
  testId: string;
  label: string;
  value: string;
};

export function SalesSummaryCards({ summary }: { summary: SalesSummary }) {
  const items: SummaryItem[] = [
    {
      testId: 'summary-total-bills',
      label: SALES_COPY.kpiBills,
      value: String(summary.total_bills ?? 0),
    },
    {
      testId: 'summary-total-revenue',
      label: SALES_COPY.kpiRevenue,
      value: formatInr(summary.total_revenue ?? 0),
    },
    {
      testId: 'summary-avg-bill',
      label: SALES_COPY.kpiAvg,
      value: formatInr(summary.avg_bill_value ?? 0),
    },
  ];

  return (
    <Grid
      cols="3"
      gap="0"
      data-testid="sales-summary"
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
    </Grid>
  );
}

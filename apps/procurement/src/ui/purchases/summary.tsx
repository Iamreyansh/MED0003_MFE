import type { PurchaseKpi } from '@medmate/procurement-contract';
import { formatInr } from '@medmate/procurement-contract';
import { Box, Card, Flex, Grid, Text } from '@medmate/ui';
import { IndianRupee, Receipt, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PURCHASES_COPY } from '../../lib/copy';
import { IconTile } from '../shared/icon-tile';

type SummaryItem = {
  testId: string;
  label: string;
  value: string;
  icon: LucideIcon;
};

export function PurchaseSummary({ kpi }: { kpi: PurchaseKpi }) {
  const items: SummaryItem[] = [
    {
      testId: 'summary-purchases-month',
      label: PURCHASES_COPY.kpiMonth,
      value: String(kpi.purchases_this_month ?? 0),
      icon: Truck,
    },
    {
      testId: 'summary-input-gst',
      label: PURCHASES_COPY.kpiGst,
      value: formatInr(kpi.input_gst_credit_this_month ?? 0),
      icon: IndianRupee,
    },
    {
      testId: 'summary-total-grns',
      label: PURCHASES_COPY.kpiTotal,
      value: String(kpi.total_grns ?? 0),
      icon: Receipt,
    },
  ];

  return (
    <Grid
      gap="4"
      className="grid-cols-1 sm:grid-cols-3"
      data-testid="purchases-summary"
    >
      {items.map((item) => (
        <Card key={item.testId} data-testid={item.testId}>
          <Flex align="start" gap="3">
            <IconTile icon={item.icon} />
            <Box className="min-w-0">
              <Text className="font-mm-heading text-mm-display font-semibold leading-none tabular-nums">
                {item.value}
              </Text>
              <Text size="sm" tone="muted" className="mt-1">
                {item.label}
              </Text>
            </Box>
          </Flex>
        </Card>
      ))}
    </Grid>
  );
}

import type { InventorySummary } from '@medmate/inventory-contract';
import { Box, Card, Flex, Grid, Text } from '@medmate/ui';
import { Boxes, Package, Timer, TriangleAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { LIST_COPY } from '../../lib/copy';
import { IconTile } from '../shared/icon-tile';

type SummaryItem = {
  testId: string;
  label: string;
  value: number;
  icon: LucideIcon;
  tone: 'primary' | 'danger';
  onClick?: () => void;
  actionLabel?: string;
};

export function ListSummary({
  summary,
  onNearExpiry,
}: {
  summary: InventorySummary;
  onNearExpiry?: () => void;
}) {
  const items: SummaryItem[] = [
    {
      testId: 'summary-total-products',
      label: LIST_COPY.kpiProducts,
      value: summary.total_products ?? 0,
      icon: Package,
      tone: 'primary',
    },
    {
      testId: 'summary-total-quantity',
      label: LIST_COPY.kpiUnits,
      value: summary.total_quantity ?? 0,
      icon: Boxes,
      tone: 'primary',
    },
    {
      testId: 'summary-low-stock',
      label: LIST_COPY.kpiLowStock,
      value: summary.low_stock ?? 0,
      icon: TriangleAlert,
      tone: 'danger',
    },
    {
      testId: 'summary-near-expiry',
      label: LIST_COPY.kpiNearExpiry,
      value: summary.near_expiry ?? 0,
      icon: Timer,
      tone: 'danger',
      onClick: onNearExpiry,
      actionLabel: LIST_COPY.nearExpiryAction,
    },
  ];

  return (
    <Grid
      gap="4"
      className="grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
      data-testid="inventory-summary"
    >
      {items.map((item) => (
        <Card
          key={item.testId}
          data-testid={item.testId}
          className={item.onClick ? 'p-0' : undefined}
        >
          {item.onClick ? (
            <button
              type="button"
              aria-label={item.actionLabel}
              className="flex w-full cursor-pointer items-start gap-3 rounded-mm p-4 text-left transition-colors duration-mm hover:bg-mm-bg"
              onClick={item.onClick}
            >
              <MetricBody item={item} />
            </button>
          ) : (
            <MetricBody item={item} />
          )}
        </Card>
      ))}
    </Grid>
  );
}

function MetricBody({ item }: { item: SummaryItem }) {
  return (
    <Flex align="start" gap="3">
      <IconTile icon={item.icon} tone={item.tone} />
      <Box className="min-w-0">
        <Text className="font-mm-heading text-mm-display font-semibold leading-none tabular-nums">
          {item.value}
        </Text>
        <Text size="sm" tone="muted" className="mt-1">
          {item.label}
        </Text>
      </Box>
    </Flex>
  );
}

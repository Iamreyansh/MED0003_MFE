import {
  ANALYTICS_TABS,
  analyticsLockCopy,
  type AnalyticsPeriod,
  type AnalyticsQuery,
  type AnalyticsTab,
} from '@medmate/analytics-contract';
import { Box, Button, Flex, Stack, Text } from '@medmate/ui';
import { useCallback, useMemo, useState } from 'react';
import type { AnalyticsMfeProps } from '../contract';
import { SCREEN_COPY, SHARED_COPY, TAB_COPY, rootTestId } from '../lib/copy';
import { GstScreen } from '../ui/gst';
import { OverviewScreen } from '../ui/overview';
import { ProductsScreen } from '../ui/products';
import { ReportsScreen } from '../ui/reports';
import { SalesRegisterScreen } from '../ui/sales-register';
import { PageHeader } from '../ui/shared/page-header';
import { PeriodToolbar } from '../ui/shared/period-toolbar';
import { PlanLock } from '../ui/shared/plan-lock';

export function AnalyticsLayout({ data }: AnalyticsMfeProps) {
  const feature = data.feature;
  const isStaff = feature.role === 'pharmacy_staff';
  const [tab, setTab] = useState<AnalyticsTab>('overview');
  const [period, setPeriod] = useState<AnalyticsPeriod>('30D');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [customApplied, setCustomApplied] = useState(0);
  const [lockMessage, setLockMessage] = useState(
    feature.analyticsLocked ? analyticsLockCopy() : '',
  );

  const onLocked = useCallback((message: string) => {
    setLockMessage(message || analyticsLockCopy());
  }, []);

  const query = useMemo<AnalyticsQuery>(() => {
    const applied = customApplied;
    return {
      period,
      date_from:
        period === 'CUSTOM' && applied >= 0 ? dateFrom || undefined : undefined,
      date_to:
        period === 'CUSTOM' && applied >= 0 ? dateTo || undefined : undefined,
    };
  }, [customApplied, dateFrom, dateTo, period]);

  const visibleTabs = ANALYTICS_TABS.filter(
    (value) => value !== 'gst' || Boolean(feature.canViewGst),
  );

  if (feature.analyticsLocked || lockMessage) {
    return (
      <Box data-testid={rootTestId()} className="w-full">
        <PageHeader
          title={SCREEN_COPY.title}
          helper={SCREEN_COPY.helper}
          kicker={SCREEN_COPY.kicker}
        />
        <PlanLock
          testId="analytics-plan-lock"
          message={lockMessage || analyticsLockCopy()}
          viewPlansLabel={SHARED_COPY.viewPlans}
          onViewPlans={() => data.capabilities?.navigate?.('/subscription')}
          isStaff={isStaff}
        />
      </Box>
    );
  }

  return (
    <Box data-testid={rootTestId()} className="w-full">
      <PageHeader
        title={SCREEN_COPY.title}
        helper={SCREEN_COPY.helper}
        kicker={SCREEN_COPY.kicker}
      />
      <Stack gap="3">
        <Text size="sm" tone="muted">
          {SHARED_COPY.fyHint}
        </Text>
        <Box as="nav" role="tablist" aria-label="Analytics sections">
          <Flex gap="2" wrap>
            {visibleTabs.map((value) => (
              <Button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                variant={tab === value ? 'primary' : 'ghost'}
                className="min-h-10 px-2 text-sm"
                data-testid={`analytics-tab-${value}`}
                onClick={() => setTab(value)}
              >
                {TAB_COPY[value]}
              </Button>
            ))}
          </Flex>
        </Box>
        <PeriodToolbar
          period={period}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onPeriod={(next) => {
            setPeriod(next);
            if (next !== 'CUSTOM') {
              setCustomApplied((count) => count + 1);
            }
          }}
          onDateFrom={setDateFrom}
          onDateTo={setDateTo}
          onApplyCustom={() => setCustomApplied((count) => count + 1)}
        />
        {tab === 'overview' ? (
          <OverviewScreen feature={feature} query={query} onLocked={onLocked} />
        ) : null}
        {tab === 'sales-register' ? (
          <SalesRegisterScreen
            feature={feature}
            query={query}
            onLocked={onLocked}
          />
        ) : null}
        {tab === 'products' ? (
          <ProductsScreen feature={feature} query={query} onLocked={onLocked} />
        ) : null}
        {tab === 'gst' && feature.canViewGst ? (
          <GstScreen feature={feature} query={query} onLocked={onLocked} />
        ) : null}
        {tab === 'reports' ? (
          <ReportsScreen feature={feature} query={query} onLocked={onLocked} />
        ) : null}
      </Stack>
    </Box>
  );
}

import type {
  AnalyticsFeatureData,
  AnalyticsOverview,
  AnalyticsQuery,
} from '@medmate/analytics-contract';
import {
  formatPaise,
  formatPct,
  isOverviewEmpty,
  isPlanFeatureLocked,
} from '@medmate/analytics-contract';
import { Button, Spinner, Stack, Text } from '@medmate/ui';
import { BarChart3 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { SHARED_COPY, dash, errorText, listOf } from '../../lib/copy';
import { EmptyState } from '../shared/empty-state';
import { FormBanner } from '../shared/form-error';
import { SectionBlock } from '../shared/section-block';

const compactBtn = 'min-h-10 px-2 text-sm';

export function OverviewScreen({
  feature,
  query,
  onLocked,
}: {
  feature: AnalyticsFeatureData;
  query: AnalyticsQuery;
  onLocked: (message: string) => void;
}) {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    const result = await feature.onSubmit({
      screen: 'analytics',
      action: 'loadOverview',
      values: query,
    });
    setLoading(false);
    if (!result.ok) {
      if (isPlanFeatureLocked(result.code)) {
        onLocked(result.formError ?? '');
        setOverview(null);
        return;
      }
      setError(errorText(result, 'Unable to load overview.'));
      setOverview(null);
      return;
    }
    setOverview(result.overview ?? null);
  }, [feature, onLocked, query]);

  useEffect(() => {
    void load();
  }, [load]);

  const financials = overview?.financials;
  const empty = !loading && !error && isOverviewEmpty(overview);
  const paymentMix = listOf(overview?.payment_mix);
  const topItems = listOf(overview?.top_items);

  return (
    <Stack gap="3">
      <FormBanner message={error} testId="analytics-overview-error" />
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
          data-testid="analytics-overview-loading"
          label="Loading overview"
        />
      ) : null}
      {empty ? (
        <EmptyState icon={BarChart3} testId="analytics-overview-empty">
          {SHARED_COPY.emptyOverview}
        </EmptyState>
      ) : null}
      {!loading && !error && overview && !empty ? (
        <>
          <SectionBlock id="section-overview-kpis" title="Period totals">
            <dl
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              data-testid="analytics-overview-cards"
            >
              <div>
                <Text size="sm" tone="muted">
                  Net revenue
                </Text>
                <Text>{formatPaise(financials?.net_revenue_paise)}</Text>
              </div>
              <div>
                <Text size="sm" tone="muted">
                  Gross profit
                </Text>
                <Text>{formatPaise(financials?.gross_profit_paise)}</Text>
              </div>
              <div>
                <Text size="sm" tone="muted">
                  Margin
                </Text>
                <Text>{formatPct(financials?.margin_pct)}</Text>
              </div>
              <div>
                <Text size="sm" tone="muted">
                  Units sold
                </Text>
                <Text>{dash(financials?.units_sold)}</Text>
              </div>
              <div>
                <Text size="sm" tone="muted">
                  Net GST
                </Text>
                <Text>{formatPaise(financials?.net_gst_paise)}</Text>
              </div>
            </dl>
          </SectionBlock>
          <SectionBlock
            id="section-overview-mix"
            title="Channel and payment mix"
            hint="Text alternative for mix values. No fabricated series."
          >
            <Text size="sm" data-testid="analytics-channel-mix">
              Online {formatPct(overview.channel_mix?.online_pct)} · Counter{' '}
              {formatPct(overview.channel_mix?.counter_pct)}
            </Text>
            {paymentMix.length > 0 ? (
              <ul data-testid="analytics-payment-mix" className="mt-2">
                {paymentMix.map((row) => (
                  <li key={row.method ?? 'method'}>
                    {dash(row.method)} {formatPct(row.pct)}
                  </li>
                ))}
              </ul>
            ) : null}
          </SectionBlock>
          {topItems.length > 0 ? (
            <SectionBlock id="section-overview-top" title="Top items">
              <ul data-testid="analytics-top-items">
                {topItems.map((item) => (
                  <li key={item.product_id ?? item.name ?? 'item'}>
                    {dash(item.name)} · {dash(item.units_sold)} units ·{' '}
                    {formatPaise(item.revenue_paise)}
                  </li>
                ))}
              </ul>
            </SectionBlock>
          ) : null}
        </>
      ) : null}
    </Stack>
  );
}

import { describe, expect, it } from 'vitest';
import {
  ANALYTICS_PERIODS,
  ANALYTICS_REPORT_IDS,
  ANALYTICS_SCREENS,
  ANALYTICS_TABS,
  analyticsLockCopy,
  formatPaise,
  formatPct,
  isAnalyticsFeatureData,
  isAnalyticsPeriod,
  isAnalyticsReportId,
  isAnalyticsScreen,
  isAnalyticsTab,
  isForbidden,
  isOverviewEmpty,
  isPlanFeatureLocked,
  isPosTokenRestricted,
  isReportNotFound,
  normalizeReportId,
} from '../index';

describe('analytics-contract', () => {
  it('recognises screens, tabs, periods, and feature payloads', () => {
    expect(ANALYTICS_SCREENS).toContain('analytics');
    expect(isAnalyticsScreen('analytics')).toBe(true);
    expect(isAnalyticsScreen('nope')).toBe(false);
    expect(isAnalyticsScreen(1)).toBe(false);
    expect(isAnalyticsTab('overview')).toBe(true);
    expect(isAnalyticsTab('gst')).toBe(true);
    expect(isAnalyticsTab('nope')).toBe(false);
    expect(isAnalyticsTab(1)).toBe(false);
    expect(ANALYTICS_TABS).toHaveLength(5);
    expect(isAnalyticsPeriod('FY')).toBe(true);
    expect(isAnalyticsPeriod('TODAY')).toBe(false);
    expect(isAnalyticsPeriod(1)).toBe(false);
    expect(ANALYTICS_PERIODS).toContain('CUSTOM');
    expect(isAnalyticsFeatureData(null)).toBe(false);
    expect(isAnalyticsFeatureData({})).toBe(false);
    expect(
      isAnalyticsFeatureData({
        screen: 'analytics',
        onSubmit: async () => ({ ok: true }),
      }),
    ).toBe(true);
  });

  it('maps lock, forbidden, and report codes', () => {
    expect(isPlanFeatureLocked('PLAN_FEATURE_LOCKED')).toBe(true);
    expect(isPlanFeatureLocked('MODULE_NOT_IN_PLAN')).toBe(true);
    expect(isPlanFeatureLocked('PLAN_UPGRADE_REQUIRED')).toBe(true);
    expect(isPlanFeatureLocked('FORBIDDEN')).toBe(false);
    expect(analyticsLockCopy()).toMatch(/Growth/i);
    expect(isReportNotFound('REPORT_NOT_FOUND')).toBe(true);
    expect(isReportNotFound('FORBIDDEN')).toBe(false);
    expect(isForbidden('FORBIDDEN')).toBe(true);
    expect(isForbidden('INSUFFICIENT_PERMISSIONS')).toBe(true);
    expect(isForbidden('PLAN_UPGRADE_REQUIRED')).toBe(false);
    expect(isPosTokenRestricted('POS_TOKEN_RESTRICTED')).toBe(true);
  });

  it('normalises catalogue report ids', () => {
    expect(ANALYTICS_REPORT_IDS).toContain('GSTR-1-DRAFT');
    expect(normalizeReportId(' daybook ')).toBe('DAYBOOK');
    expect(isAnalyticsReportId('pl-statement')).toBe(true);
    expect(isAnalyticsReportId('unknown')).toBe(false);
    expect(isAnalyticsReportId('')).toBe(false);
  });

  it('formats paise and percent without inventing values', () => {
    expect(formatPaise(null)).toBe('—');
    expect(formatPaise('x')).toBe('—');
    expect(formatPaise(Number.NaN)).toBe('—');
    expect(formatPaise(2840000)).toMatch(/28,400/);
    expect(formatPct(null)).toBe('—');
    expect(formatPct(24)).toBe('24.0%');
    expect(formatPct(Number.NaN)).toBe('—');
  });

  it('treats zero overview metrics as empty, not a trend', () => {
    expect(isOverviewEmpty(null)).toBe(true);
    expect(
      isOverviewEmpty({
        financials: { net_revenue_paise: 0, units_sold: 0 },
        top_items: [],
        payment_mix: [],
      }),
    ).toBe(true);
    expect(
      isOverviewEmpty({
        financials: { net_revenue_paise: 100, units_sold: 0 },
        top_items: [],
        payment_mix: [],
      }),
    ).toBe(false);
    expect(isOverviewEmpty(undefined)).toBe(true);
    expect(isOverviewEmpty({})).toBe(true);
    expect(
      isOverviewEmpty({
        financials: { units_sold: 4 },
        top_items: undefined,
        payment_mix: undefined,
      }),
    ).toBe(false);
    expect(
      isOverviewEmpty({
        top_items: [{ name: 'X' }],
        payment_mix: [],
      }),
    ).toBe(false);
    expect(
      isOverviewEmpty({
        top_items: [],
        payment_mix: [{ method: 'UPI', pct: 10 }],
      }),
    ).toBe(false);
  });
});

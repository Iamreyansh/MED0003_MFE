import type {
  AnalyticsCommand,
  AnalyticsSubmitResult,
} from '@medmate/analytics-contract';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OVERVIEW_OK, data, feature } from '../../../app/__tests__/helpers';
import AnalyticsMfe from '../../../app/AnalyticsMfe';

afterEach(() => {
  cleanup();
});

describe('OverviewScreen', () => {
  it('renders cards and mix text without a fake trend', async () => {
    render(<AnalyticsMfe data={data(feature(async () => OVERVIEW_OK))} />);
    expect(await screen.findByTestId('analytics-overview-cards')).toBeTruthy();
    expect(screen.getByTestId('analytics-top-items')).toHaveTextContent(
      'Metformin',
    );
    expect(screen.queryByText(/sparkline|trend line/i)).toBeNull();
  });

  it('shows empty when Core returns zeros', async () => {
    render(
      <AnalyticsMfe
        data={data(
          feature(async () => ({
            ok: true,
            overview: {
              financials: { net_revenue_paise: 0, units_sold: 0 },
              top_items: [],
              payment_mix: [],
            },
          })),
        )}
      />,
    );
    expect(await screen.findByTestId('analytics-overview-empty')).toBeTruthy();
  });

  it('retries after error and then locks on PLAN_UPGRADE_REQUIRED', async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn<(command: AnalyticsCommand) => Promise<AnalyticsSubmitResult>>()
      .mockResolvedValueOnce({ ok: false, formError: 'Down' })
      .mockResolvedValueOnce({
        ok: false,
        code: 'PLAN_UPGRADE_REQUIRED',
      });
    render(<AnalyticsMfe data={data(feature(onSubmit))} />);
    expect(
      await screen.findByTestId('analytics-overview-error'),
    ).toHaveTextContent('Down');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByTestId('analytics-plan-lock')).toBeTruthy();
  });

  it('renders cards without mix or top-item lists', async () => {
    render(
      <AnalyticsMfe
        data={data(
          feature(async () => ({
            ok: true,
            overview: {
              financials: { net_revenue_paise: 100, units_sold: 2 },
              top_items: [],
              payment_mix: [],
            },
          })),
        )}
      />,
    );
    expect(await screen.findByTestId('analytics-overview-cards')).toBeTruthy();
    expect(screen.queryByTestId('analytics-payment-mix')).toBeNull();
    expect(screen.queryByTestId('analytics-top-items')).toBeNull();
  });

  it('treats a missing overview payload as empty', async () => {
    render(<AnalyticsMfe data={data(feature(async () => ({ ok: true })))} />);
    expect(await screen.findByTestId('analytics-overview-empty')).toBeTruthy();
  });

  it('falls back when mix method and top-item ids are absent', async () => {
    render(
      <AnalyticsMfe
        data={data(
          feature(async () => ({
            ok: true,
            overview: {
              financials: { net_revenue_paise: 50, units_sold: 1 },
              top_items: [{ units_sold: 1, revenue_paise: 50 }],
              payment_mix: [{ pct: 100 }],
            },
          })),
        )}
      />,
    );
    expect(await screen.findByTestId('analytics-payment-mix')).toBeTruthy();
    expect(screen.getByTestId('analytics-top-items')).toBeTruthy();
  });
});

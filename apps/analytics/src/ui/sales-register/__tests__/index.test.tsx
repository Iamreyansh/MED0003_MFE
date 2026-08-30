import type {
  AnalyticsCommand,
  AnalyticsSubmitResult,
} from '@medmate/analytics-contract';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SALES_OK, data, feature } from '../../../app/__tests__/helpers';
import AnalyticsMfe from '../../../app/AnalyticsMfe';

afterEach(() => {
  cleanup();
});

describe('SalesRegisterScreen', () => {
  it('lists sales and pages when meta is present', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async (command: AnalyticsCommand): Promise<AnalyticsSubmitResult> => {
        if (command.action === 'loadOverview') {
          return { ok: true, overview: { financials: { units_sold: 1 } } };
        }
        return SALES_OK;
      },
    );
    render(<AnalyticsMfe data={data(feature(onSubmit))} />);
    await user.click(await screen.findByTestId('analytics-tab-sales-register'));
    expect(await screen.findByTestId('analytics-sales-table')).toBeTruthy();
    expect(screen.getByText('INV-001')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(
      onSubmit.mock.calls.some(
        ([command]) =>
          command.action === 'loadSalesRegister' && command.values?.page === 2,
      ),
    ).toBe(true);
  });

  it('shows empty and retries a recoverable error', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async (command: AnalyticsCommand): Promise<AnalyticsSubmitResult> => {
        if (command.action === 'loadOverview') {
          return { ok: true, overview: { financials: { units_sold: 1 } } };
        }
        return { ok: false, formError: 'Down' };
      },
    );
    onSubmit
      .mockResolvedValueOnce({
        ok: true,
        overview: { financials: { units_sold: 1 } },
      })
      .mockResolvedValueOnce({ ok: false, formError: 'Down' })
      .mockResolvedValueOnce({
        ok: true,
        salesRegister: { sales: [] },
        meta: { page: 1 },
      });
    render(<AnalyticsMfe data={data(feature(onSubmit))} />);
    await user.click(await screen.findByTestId('analytics-tab-sales-register'));
    expect(
      await screen.findByTestId('analytics-sales-error'),
    ).toHaveTextContent('Down');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByTestId('analytics-sales-empty')).toBeTruthy();
  });

  it('locks the page when sales-register is plan gated', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async (command: AnalyticsCommand): Promise<AnalyticsSubmitResult> => {
        if (command.action === 'loadOverview') {
          return { ok: true, overview: { financials: { units_sold: 1 } } };
        }
        return { ok: false, code: 'PLAN_FEATURE_LOCKED' };
      },
    );
    render(<AnalyticsMfe data={data(feature(onSubmit))} />);
    await user.click(await screen.findByTestId('analytics-tab-sales-register'));
    expect(await screen.findByTestId('analytics-plan-lock')).toBeTruthy();
  });

  it('renders rows without totals or pager when meta is absent', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async (command: AnalyticsCommand): Promise<AnalyticsSubmitResult> => {
        if (command.action === 'loadOverview') {
          return { ok: true, overview: { financials: { units_sold: 1 } } };
        }
        return {
          ok: true,
          salesRegister: {
            sales: [
              {
                invoice_number: 'INV-2',
                sale_date: '2026-08-01',
                channel: 'COUNTER',
              },
            ],
          },
        };
      },
    );
    render(<AnalyticsMfe data={data(feature(onSubmit))} />);
    await user.click(await screen.findByTestId('analytics-tab-sales-register'));
    expect(await screen.findByTestId('analytics-sales-table')).toBeTruthy();
    expect(screen.queryByTestId('analytics-sales-totals')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Next page' })).toBeNull();
  });

  it('pages when meta has no page and still shows status', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async (command: AnalyticsCommand): Promise<AnalyticsSubmitResult> => {
        if (command.action === 'loadOverview') {
          return { ok: true, overview: { financials: { units_sold: 1 } } };
        }
        return {
          ok: true,
          salesRegister: {
            sales: [{ invoice_number: 'INV-3' }],
            totals: { total_sales: 2 },
          },
          meta: { total: 2, has_next: true },
        };
      },
    );
    render(<AnalyticsMfe data={data(feature(onSubmit))} />);
    await user.click(await screen.findByTestId('analytics-tab-sales-register'));
    expect(await screen.findByText('INV-3')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(
      onSubmit.mock.calls.some(
        ([command]) =>
          command.action === 'loadSalesRegister' && command.values?.page === 2,
      ),
    ).toBe(true);
  });
});

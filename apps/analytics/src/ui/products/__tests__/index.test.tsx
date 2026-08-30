import type {
  AnalyticsCommand,
  AnalyticsSubmitResult,
} from '@medmate/analytics-contract';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PRODUCTS_OK, data, feature } from '../../../app/__tests__/helpers';
import AnalyticsMfe from '../../../app/AnalyticsMfe';

afterEach(() => {
  cleanup();
});

describe('ProductsScreen', () => {
  it('lists products and applies Core sort and dead-stock filters', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async (command: AnalyticsCommand): Promise<AnalyticsSubmitResult> => {
        if (command.action === 'loadOverview') {
          return { ok: true, overview: { financials: { units_sold: 1 } } };
        }
        return PRODUCTS_OK;
      },
    );
    render(<AnalyticsMfe data={data(feature(onSubmit))} />);
    await user.click(await screen.findByTestId('analytics-tab-products'));
    expect(await screen.findByTestId('analytics-products-table')).toBeTruthy();
    await user.selectOptions(screen.getByLabelText('Sort'), 'margin_pct');
    await user.selectOptions(screen.getByLabelText('Stock'), 'dead');
    expect(
      onSubmit.mock.calls.some(
        ([command]) =>
          command.action === 'loadProducts' &&
          command.values?.sort === 'margin_pct' &&
          command.values.dead_stock_only === true,
      ),
    ).toBe(true);
  });

  it('shows empty and retries', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async (command: AnalyticsCommand): Promise<AnalyticsSubmitResult> => {
        if (command.action === 'loadOverview') {
          return { ok: true, overview: { financials: { units_sold: 1 } } };
        }
        return { ok: false, formError: 'Down' };
      },
    );
    render(<AnalyticsMfe data={data(feature(onSubmit))} />);
    await user.click(await screen.findByTestId('analytics-tab-products'));
    expect(
      await screen.findByTestId('analytics-products-error'),
    ).toHaveTextContent('Down');
    onSubmit.mockResolvedValueOnce({
      ok: true,
      products: { products: [] },
      meta: { page: 1 },
    });
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByTestId('analytics-products-empty')).toBeTruthy();
  });

  it('locks the page when products is plan gated', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async (command: AnalyticsCommand): Promise<AnalyticsSubmitResult> => {
        if (command.action === 'loadOverview') {
          return { ok: true, overview: { financials: { units_sold: 1 } } };
        }
        return { ok: false, code: 'MODULE_NOT_IN_PLAN' };
      },
    );
    render(<AnalyticsMfe data={data(feature(onSubmit))} />);
    await user.click(await screen.findByTestId('analytics-tab-products'));
    expect(await screen.findByTestId('analytics-plan-lock')).toBeTruthy();
  });

  it('pages unnamed dead-stock rows', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async (command: AnalyticsCommand): Promise<AnalyticsSubmitResult> => {
        if (command.action === 'loadOverview') {
          return { ok: true, overview: { financials: { units_sold: 1 } } };
        }
        return {
          ok: true,
          products: {
            products: [{ dead_stock_flag: true, units_sold: 0 }],
          },
          meta: { total: 2, has_next: true },
        };
      },
    );
    render(<AnalyticsMfe data={data(feature(onSubmit))} />);
    await user.click(await screen.findByTestId('analytics-tab-products'));
    expect(
      await screen.findByTestId('analytics-products-table'),
    ).toHaveTextContent('Yes');
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(
      onSubmit.mock.calls.some(
        ([command]) =>
          command.action === 'loadProducts' && command.values?.page === 2,
      ),
    ).toBe(true);
  });
});

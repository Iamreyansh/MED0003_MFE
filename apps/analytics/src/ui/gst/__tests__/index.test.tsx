import type {
  AnalyticsCommand,
  AnalyticsSubmitResult,
} from '@medmate/analytics-contract';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GST_OK, data, feature } from '../../../app/__tests__/helpers';
import AnalyticsMfe from '../../../app/AnalyticsMfe';

afterEach(() => {
  cleanup();
});

describe('GstScreen', () => {
  it('renders P&L and slabs for an owner', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async (command: AnalyticsCommand): Promise<AnalyticsSubmitResult> => {
        if (command.action === 'loadOverview') {
          return { ok: true, overview: { financials: { units_sold: 1 } } };
        }
        return GST_OK;
      },
    );
    render(<AnalyticsMfe data={data(feature(onSubmit))} />);
    await user.click(await screen.findByTestId('analytics-tab-gst'));
    expect(await screen.findByTestId('analytics-gst-pl')).toBeTruthy();
    expect(screen.getByTestId('analytics-gst-slabs')).toBeTruthy();
    expect(screen.getByText(/does not file GST/i)).toBeTruthy();
  });

  it('hides GST for staff and shows forbidden when Core returns 403', async () => {
    const user = userEvent.setup();
    render(
      <AnalyticsMfe
        data={data(
          feature(
            async () => ({
              ok: true,
              overview: { financials: { units_sold: 1 } },
            }),
            {
              role: 'pharmacy_staff',
              canViewGst: false,
              canFavorite: false,
            },
          ),
        )}
      />,
    );
    expect(screen.queryByTestId('analytics-tab-gst')).toBeNull();
    const onSubmit = vi.fn(
      async (command: AnalyticsCommand): Promise<AnalyticsSubmitResult> => {
        if (command.action === 'loadOverview') {
          return { ok: true, overview: { financials: { units_sold: 1 } } };
        }
        return { ok: false, code: 'FORBIDDEN', formError: 'Owner only' };
      },
    );
    cleanup();
    render(
      <AnalyticsMfe data={data(feature(onSubmit, { canViewGst: true }))} />,
    );
    await user.click(await screen.findByTestId('analytics-tab-gst'));
    expect(await screen.findByTestId('analytics-gst-error')).toHaveTextContent(
      /permission/i,
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByTestId('analytics-gst-error')).toBeTruthy();
  });

  it('shows empty GST and then a plan lock', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async (command: AnalyticsCommand): Promise<AnalyticsSubmitResult> => {
        if (command.action === 'loadOverview') {
          return { ok: true, overview: { financials: { units_sold: 1 } } };
        }
        return { ok: true, gst: {} };
      },
    );
    render(<AnalyticsMfe data={data(feature(onSubmit))} />);
    await user.click(await screen.findByTestId('analytics-tab-gst'));
    expect(await screen.findByTestId('analytics-gst-empty')).toBeTruthy();
    cleanup();
    render(
      <AnalyticsMfe
        data={data(
          feature(async (command) => {
            if (command.action === 'loadOverview') {
              return { ok: true, overview: { financials: { units_sold: 1 } } };
            }
            return { ok: false, code: 'PLAN_UPGRADE_REQUIRED' };
          }),
        )}
      />,
    );
    await user.click(await screen.findByTestId('analytics-tab-gst'));
    expect(await screen.findByTestId('analytics-plan-lock')).toBeTruthy();
  });

  it('maps a generic GST error without treating it as forbidden', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async (command: AnalyticsCommand): Promise<AnalyticsSubmitResult> => {
        if (command.action === 'loadOverview') {
          return { ok: true, overview: { financials: { units_sold: 1 } } };
        }
        return { ok: false, code: 'VALIDATION_ERROR' };
      },
    );
    render(<AnalyticsMfe data={data(feature(onSubmit))} />);
    await user.click(await screen.findByTestId('analytics-tab-gst'));
    expect(await screen.findByTestId('analytics-gst-error')).toHaveTextContent(
      'VALIDATION_ERROR',
    );
    cleanup();
    render(
      <AnalyticsMfe
        data={data(
          feature(async (command) => {
            if (command.action === 'loadOverview') {
              return { ok: true, overview: { financials: { units_sold: 1 } } };
            }
            return {
              ok: true,
              gst: {
                day_book: [{ date: '2026-08-24', type: 'SALE' }],
              },
            };
          }),
        )}
      />,
    );
    await user.click(await screen.findByTestId('analytics-tab-gst'));
    expect(await screen.findByTestId('analytics-gst-daybook')).toBeTruthy();
    cleanup();
    render(
      <AnalyticsMfe
        data={data(
          feature(async (command) => {
            if (command.action === 'loadOverview') {
              return { ok: true, overview: { financials: { units_sold: 1 } } };
            }
            return { ok: true };
          }),
        )}
      />,
    );
    await user.click(await screen.findByTestId('analytics-tab-gst'));
    expect(await screen.findByTestId('analytics-gst-empty')).toBeTruthy();
  });
});

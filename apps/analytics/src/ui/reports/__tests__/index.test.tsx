import type {
  AnalyticsCommand,
  AnalyticsSubmitResult,
} from '@medmate/analytics-contract';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CATALOGUE_OK,
  REPORT_OK,
  data,
  feature,
} from '../../../app/__tests__/helpers';
import AnalyticsMfe from '../../../app/AnalyticsMfe';

afterEach(() => {
  cleanup();
});

function openReportAt(index: number) {
  const button = screen.getAllByRole('button', { name: 'Open report' })[index];
  if (!button) {
    throw new Error('missing open report');
  }
  return button;
}

function reportsSubmit(
  overrides: Partial<
    Record<AnalyticsCommand['action'], () => Promise<AnalyticsSubmitResult>>
  > = {},
) {
  return vi.fn(
    async (command: AnalyticsCommand): Promise<AnalyticsSubmitResult> => {
      const override = overrides[command.action];
      if (override) {
        return override();
      }
      if (command.action === 'loadOverview') {
        return { ok: true, overview: { financials: { units_sold: 1 } } };
      }
      if (command.action === 'loadCatalogue') {
        return CATALOGUE_OK;
      }
      if (command.action === 'loadReport') {
        return REPORT_OK;
      }
      if (command.action === 'favorite') {
        return {
          ok: true,
          report: {
            report_id: command.values.reportId,
            is_favorite: command.values.is_favorite,
          },
        };
      }
      return { ok: true };
    },
  );
}

describe('ReportsScreen', () => {
  it('lists catalogue, opens a report, and toggles favorite', async () => {
    const user = userEvent.setup();
    const onSubmit = reportsSubmit();
    render(<AnalyticsMfe data={data(feature(onSubmit))} />);
    await user.click(await screen.findByTestId('analytics-tab-reports'));
    expect(await screen.findByTestId('analytics-reports-table')).toBeTruthy();
    await user.click(openReportAt(0));
    expect(await screen.findByTestId('analytics-report-table')).toBeTruthy();
    await user.click(screen.getByTestId('analytics-favorite-DAYBOOK'));
    expect(
      onSubmit.mock.calls.some(
        ([command]) =>
          command.action === 'favorite' &&
          command.values.reportId === 'DAYBOOK' &&
          command.values.is_favorite === true,
      ),
    ).toBe(true);
  });

  it('shows 404 for an unknown report and hides favorite for staff', async () => {
    const user = userEvent.setup();
    const onSubmit = reportsSubmit({
      loadReport: async () => ({
        ok: false,
        code: 'REPORT_NOT_FOUND',
      }),
    });
    render(
      <AnalyticsMfe
        data={data(
          feature(onSubmit, {
            role: 'pharmacy_staff',
            canFavorite: false,
            canViewGst: false,
          }),
        )}
      />,
    );
    await user.click(await screen.findByTestId('analytics-tab-reports'));
    expect(await screen.findByTestId('analytics-reports-table')).toBeTruthy();
    expect(screen.getByTestId('analytics-favorite-DAYBOOK')).toBeDisabled();
    await user.click(openReportAt(0));
    expect(
      await screen.findByTestId('analytics-report-error'),
    ).toHaveTextContent(/not found/i);
  });

  it('retries catalogue errors', async () => {
    const user = userEvent.setup();
    const onSubmit = reportsSubmit({
      loadCatalogue: vi
        .fn()
        .mockResolvedValueOnce({ ok: false, formError: 'Down' })
        .mockResolvedValue(CATALOGUE_OK),
    });
    render(<AnalyticsMfe data={data(feature(onSubmit))} />);
    await user.click(await screen.findByTestId('analytics-tab-reports'));
    expect(
      await screen.findByTestId('analytics-reports-error'),
    ).toHaveTextContent('Down');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByTestId('analytics-reports-table')).toBeTruthy();
  });

  it('covers empty catalogue, empty report, favorite failure, and lock', async () => {
    const user = userEvent.setup();
    const onSubmit = reportsSubmit({
      loadCatalogue: async () => ({ ok: true, reports: [] }),
    });
    render(<AnalyticsMfe data={data(feature(onSubmit))} />);
    await user.click(await screen.findByTestId('analytics-tab-reports'));
    expect(await screen.findByTestId('analytics-reports-empty')).toBeTruthy();
    cleanup();
    const failFavorite = reportsSubmit({
      favorite: async () => ({ ok: false, formError: 'No' }),
      loadReport: async () => ({
        ok: true,
        report: { name: 'Empty', columns: ['a'], rows: [] },
      }),
    });
    render(<AnalyticsMfe data={data(feature(failFavorite))} />);
    await user.click(await screen.findByTestId('analytics-tab-reports'));
    await user.click(await screen.findByTestId('analytics-favorite-DAYBOOK'));
    expect(
      await screen.findByTestId('analytics-reports-error'),
    ).toHaveTextContent('No');
    await user.click(openReportAt(0));
    expect(await screen.findByTestId('analytics-report-empty')).toBeTruthy();
    cleanup();
    render(
      <AnalyticsMfe
        data={data(
          feature(async (command) => {
            if (command.action === 'loadOverview') {
              return { ok: true, overview: { financials: { units_sold: 1 } } };
            }
            return { ok: false, code: 'PLAN_FEATURE_LOCKED' };
          }),
        )}
      />,
    );
    await user.click(await screen.findByTestId('analytics-tab-reports'));
    expect(await screen.findByTestId('analytics-plan-lock')).toBeTruthy();
  });

  it('locks from report load and ignores a catalogue row without an id', async () => {
    const user = userEvent.setup();
    const onSubmit = reportsSubmit({
      loadCatalogue: async () => ({
        ok: true,
        reports: [
          { name: 'Orphan', group: 'GST', is_favorite: false },
          {
            report_id: 'DAYBOOK',
            name: 'Day Book',
            group: 'SUMMARY',
            is_favorite: false,
          },
        ],
      }),
      loadReport: async () => ({ ok: false, code: 'PLAN_FEATURE_LOCKED' }),
    });
    render(<AnalyticsMfe data={data(feature(onSubmit))} />);
    await user.click(await screen.findByTestId('analytics-tab-reports'));
    expect(screen.queryByTestId('analytics-favorite-row')).toBeNull();
    expect(
      onSubmit.mock.calls.some((entry) => entry[0].action === 'favorite'),
    ).toBe(false);
    await user.click(openReportAt(0));
    await user.click(openReportAt(1));
    expect(await screen.findByTestId('analytics-plan-lock')).toBeTruthy();
  });

  it('renders report cells and favorite fallback when Core omits the flag', async () => {
    const user = userEvent.setup();
    const onSubmit = reportsSubmit({
      loadReport: async () => ({
        ok: true,
        report: {
          name: 'Day Book',
          columns: ['date'],
          rows: [['2026-08-24'], 'skip' as unknown as unknown[]],
        },
      }),
      favorite: async () => ({ ok: true }),
    });
    render(<AnalyticsMfe data={data(feature(onSubmit))} />);
    await user.click(await screen.findByTestId('analytics-tab-reports'));
    await user.click(openReportAt(0));
    expect(await screen.findByTestId('analytics-report-table')).toBeTruthy();
    expect(screen.getByLabelText(/Remove favorite GSTR-1 Draft/i)).toBeTruthy();
    await user.click(screen.getByTestId('analytics-favorite-GSTR-1-DRAFT'));
    expect(
      onSubmit.mock.calls.some((entry) => entry[0].action === 'favorite'),
    ).toBe(true);
  });

  it('maps a generic report error and a missing report body', async () => {
    const user = userEvent.setup();
    const onSubmit = reportsSubmit({
      loadReport: vi
        .fn()
        .mockResolvedValueOnce({ ok: false, code: 'VALIDATION_ERROR' })
        .mockResolvedValueOnce({ ok: true }),
    });
    render(<AnalyticsMfe data={data(feature(onSubmit))} />);
    await user.click(await screen.findByTestId('analytics-tab-reports'));
    await user.click(openReportAt(0));
    expect(
      await screen.findByTestId('analytics-report-error'),
    ).toHaveTextContent('VALIDATION_ERROR');
    await user.click(openReportAt(0));
    expect(screen.queryByTestId('analytics-report-table')).toBeNull();
  });
});

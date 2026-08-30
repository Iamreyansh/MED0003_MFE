import type { AnalyticsCommand } from '@medmate/analytics-contract';
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AnalyticsMfe from '../AnalyticsMfe';
import { OVERVIEW_OK, data, feature } from './helpers';

afterEach(() => {
  cleanup();
});

describe('AnalyticsMfe', () => {
  it('shows a contract error without a screen', () => {
    render(
      <AnalyticsMfe
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: { title: 'x' } as never,
        }}
      />,
    );
    expect(screen.getByTestId('analytics-contract-error')).toBeTruthy();
  });

  it('renders overview for a Growth owner', async () => {
    render(<AnalyticsMfe data={data(feature(async () => OVERVIEW_OK))} />);
    expect(await screen.findByTestId('analytics-analytics-page')).toBeTruthy();
    expect(await screen.findByTestId('analytics-overview-cards')).toBeTruthy();
    expect(screen.getByTestId('analytics-channel-mix')).toHaveTextContent(
      'Online',
    );
  });

  it('shows Growth lock and hides view-plans for staff', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const { rerender } = render(
      <AnalyticsMfe
        data={data(
          feature(async () => ({ ok: true }), { analyticsLocked: true }),
          {
            capabilities: { navigate: onNavigate },
          },
        )}
      />,
    );
    expect(await screen.findByTestId('analytics-plan-lock')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'View plans' }));
    expect(onNavigate).toHaveBeenCalledWith('/subscription');
    rerender(
      <AnalyticsMfe
        data={data(
          feature(async () => ({ ok: true }), {
            analyticsLocked: true,
            role: 'pharmacy_staff',
            canViewGst: false,
            canFavorite: false,
          }),
        )}
      />,
    );
    expect(screen.queryByRole('button', { name: 'View plans' })).toBeNull();
  });

  it('sends Core period and custom date query', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (_command: AnalyticsCommand) => OVERVIEW_OK);
    render(<AnalyticsMfe data={data(feature(onSubmit))} />);
    await screen.findByTestId('analytics-overview-cards');
    await user.selectOptions(screen.getByLabelText('Period'), 'FY');
    expect(
      onSubmit.mock.calls.some((call) => {
        const command = call[0];
        return (
          command?.action === 'loadOverview' && command.values?.period === 'FY'
        );
      }),
    ).toBe(true);
    await user.selectOptions(screen.getByLabelText('Period'), 'CUSTOM');
    await user.type(screen.getByLabelText('From'), '2026-08-01');
    await user.type(screen.getByLabelText('To'), '2026-08-30');
    await user.click(screen.getByRole('button', { name: 'Apply dates' }));
    expect(
      onSubmit.mock.calls.some((call) => {
        const command = call[0];
        return (
          command?.action === 'loadOverview' &&
          command.values?.period === 'CUSTOM' &&
          command.values.date_from === '2026-08-01'
        );
      }),
    ).toBe(true);
  });

  it('locks from an empty Core lock message and ignores missing navigate', async () => {
    const user = userEvent.setup();
    render(
      <AnalyticsMfe
        data={data(
          feature(async () => ({
            ok: false,
            code: 'PLAN_FEATURE_LOCKED',
            formError: '',
          })),
        )}
      />,
    );
    expect(await screen.findByTestId('analytics-plan-lock')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'View plans' }));
    expect(screen.getByTestId('analytics-plan-lock')).toBeTruthy();
  });

  it('uses lock copy when analyticsLocked flips on after first render', async () => {
    const { rerender } = render(
      <AnalyticsMfe data={data(feature(async () => OVERVIEW_OK))} />,
    );
    expect(await screen.findByTestId('analytics-overview-cards')).toBeTruthy();
    rerender(
      <AnalyticsMfe
        data={data(feature(async () => OVERVIEW_OK, { analyticsLocked: true }))}
      />,
    );
    expect(screen.getByTestId('analytics-plan-lock')).toBeTruthy();
  });
});

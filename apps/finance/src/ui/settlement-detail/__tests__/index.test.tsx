import type {
  FinanceCommand,
  FinanceSubmitResult,
} from '@medmate/finance-contract';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  SETTLEMENT_DETAIL,
  data,
  feature,
} from '../../../app/__tests__/helpers';
import FinanceMfe from '../../../app/FinanceMfe';

afterEach(() => {
  cleanup();
});

function detailSubmit(
  overrides: Partial<
    Record<FinanceCommand['action'], () => Promise<FinanceSubmitResult>>
  > = {},
) {
  return vi.fn(
    async (command: FinanceCommand): Promise<FinanceSubmitResult> => {
      const override = overrides[command.action];
      if (override) {
        return override();
      }
      if (command.action === 'load') {
        return SETTLEMENT_DETAIL;
      }
      return { ok: true };
    },
  );
}

describe('SettlementDetailScreen', () => {
  it('renders present fields and support CTA', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <FinanceMfe
        data={data(feature('settlement-detail', detailSubmit()), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    expect(await screen.findByTestId('settlement-fields')).toBeTruthy();
    expect(
      screen.getByTestId('settlement-field-net_payable'),
    ).toHaveTextContent('Net payable');
    expect(screen.queryByTestId('settlement-field-notes')).toBeNull();
    expect(screen.queryByText(/gmv −/i)).toBeNull();
    await user.click(
      screen.getByRole('button', { name: 'Raise a support ticket' }),
    );
    expect(onNavigate).toHaveBeenCalledWith('/support/new');
  });

  it('shows not-found, missing id, and retries load errors', async () => {
    const user = userEvent.setup();
    render(
      <FinanceMfe
        data={data(
          feature(
            'settlement-detail',
            async () => ({ ok: false, code: 'SETTLEMENT_NOT_FOUND' }),
            { settlementId: 'missing' },
          ),
        )}
      />,
    );
    expect(await screen.findByTestId('settlement-not-found')).toBeTruthy();

    cleanup();
    render(
      <FinanceMfe
        data={data(
          feature('settlement-detail', async () => ({ ok: true }), {
            settlementId: null,
          }),
        )}
      />,
    );
    expect(await screen.findByTestId('settlement-not-found')).toBeTruthy();

    cleanup();
    const onSubmit = detailSubmit({
      load: vi
        .fn()
        .mockResolvedValueOnce({ ok: false, formError: 'Down' })
        .mockResolvedValue(SETTLEMENT_DETAIL),
    });
    render(<FinanceMfe data={data(feature('settlement-detail', onSubmit))} />);
    expect(
      await screen.findByTestId('settlement-detail-error'),
    ).toHaveTextContent('Down');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByTestId('settlement-fields')).toBeTruthy();
  });
});

import type {
  FinanceCommand,
  FinanceSubmitResult,
} from '@medmate/finance-contract';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  SETTLEMENT_ID,
  SETTLEMENT_LIST,
  data,
  feature,
} from '../../../app/__tests__/helpers';
import FinanceMfe from '../../../app/FinanceMfe';

afterEach(() => {
  cleanup();
});

function listSubmit(
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
        return SETTLEMENT_LIST;
      }
      return { ok: true };
    },
  );
}

describe('SettlementsScreen', () => {
  it('lists settlements and opens detail', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <FinanceMfe
        data={data(feature('settlements', listSubmit()), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    expect(await screen.findByTestId('settlements-table')).toBeTruthy();
    expect(
      screen.getByRole('columnheader', { name: 'Net payable' }),
    ).toBeTruthy();
    expect(screen.queryByText(/gmv −/i)).toBeNull();
    await user.click(screen.getByTestId(`settlement-row-${SETTLEMENT_ID}`));
    expect(onNavigate).toHaveBeenCalledWith(
      `/finance/settlements/${SETTLEMENT_ID}`,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(onNavigate).toHaveBeenCalledTimes(2);
  });

  it('pages, retries after error, and shows empty', async () => {
    const user = userEvent.setup();
    const onSubmit = listSubmit({
      load: vi
        .fn()
        .mockResolvedValueOnce({ ok: false, formError: 'Down' })
        .mockResolvedValueOnce(SETTLEMENT_LIST)
        .mockResolvedValue({ ok: true, settlements: [], meta: { page: 2 } }),
    });
    render(<FinanceMfe data={data(feature('settlements', onSubmit))} />);
    expect(await screen.findByTestId('settlements-error')).toHaveTextContent(
      'Down',
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByTestId('settlements-table')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(
      onSubmit.mock.calls.some(
        (call) =>
          call[0].screen === 'settlements' &&
          call[0].action === 'load' &&
          call[0].values?.page === 2,
      ),
    ).toBe(true);
    expect(await screen.findByTestId('settlements-empty')).toBeTruthy();
  });

  it('shows forbidden copy without inventing rows', async () => {
    render(
      <FinanceMfe
        data={data(
          feature('settlements', async () => ({
            ok: false,
            code: 'FORBIDDEN',
            formError: 'You do not have permission to do that.',
          })),
        )}
      />,
    );
    expect(await screen.findByTestId('settlements-error')).toHaveTextContent(
      'permission',
    );
    expect(screen.queryByTestId('settlements-table')).toBeNull();
  });
});

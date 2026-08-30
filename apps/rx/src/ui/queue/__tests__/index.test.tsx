import type { RxCommand, RxSubmitResult } from '@medmate/rx-contract';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RX_LIST, data, feature } from '../../../app/__tests__/helpers';
import RxMfe from '../../../app/RxMfe';

afterEach(() => {
  cleanup();
});

function queueSubmit(
  overrides: Partial<
    Record<RxCommand['action'], () => Promise<RxSubmitResult>>
  > = {},
) {
  return vi.fn(async (command: RxCommand): Promise<RxSubmitResult> => {
    const override = overrides[command.action];
    if (override) {
      return override();
    }
    if (command.action === 'load') {
      return RX_LIST;
    }
    return { ok: true };
  });
}

describe('QueueScreen', () => {
  it('lists prescriptions and opens detail', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <RxMfe
        data={data(feature('queue', queueSubmit()), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    expect(await screen.findByTestId('rx-queue-table')).toBeTruthy();
    expect(screen.getAllByText('PENDING_REVIEW').length).toBeGreaterThan(0);
    await user.click(screen.getByTestId('rx-row-rx-1'));
    expect(onNavigate).toHaveBeenCalledWith('/prescriptions/rx-1');
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(onNavigate).toHaveBeenCalledTimes(2);
  });

  it('shows plan lock and empty state', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const { rerender } = render(
      <RxMfe
        data={data(
          feature('queue', async () => ({
            ok: false,
            code: 'PLAN_FEATURE_LOCKED',
          })),
          { capabilities: { navigate: onNavigate } },
        )}
      />,
    );
    expect(await screen.findByTestId('rx-queue-plan-lock')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'View plans' }));
    expect(onNavigate).toHaveBeenCalledWith('/subscription');
    rerender(
      <RxMfe
        data={data(
          feature('queue', async () => ({
            ok: true,
            prescriptions: [],
            meta: { page: 1 },
          })),
        )}
      />,
    );
    expect(await screen.findByTestId('rx-queue-empty')).toBeTruthy();
  });

  it('retries after a load error and pages', async () => {
    const user = userEvent.setup();
    const onSubmit = queueSubmit({
      load: vi
        .fn()
        .mockResolvedValueOnce({ ok: false, formError: 'Down' })
        .mockResolvedValue(RX_LIST),
    });
    render(<RxMfe data={data(feature('queue', onSubmit))} />);
    expect(await screen.findByTestId('rx-queue-error')).toHaveTextContent(
      'Down',
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByTestId('rx-queue-table')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('changes the status filter', async () => {
    const user = userEvent.setup();
    const onSubmit = queueSubmit();
    render(<RxMfe data={data(feature('queue', onSubmit))} />);
    await screen.findByTestId('rx-queue-table');
    await user.selectOptions(screen.getByLabelText('Status'), 'APPROVED');
    await user.selectOptions(screen.getByLabelText('Status'), '');
    expect(onSubmit).toHaveBeenCalled();
  });

  it('hides view-plans for staff lock', async () => {
    render(
      <RxMfe
        data={data(
          feature(
            'queue',
            async () => ({ ok: false, code: 'MODULE_NOT_IN_PLAN' }),
            { role: 'pharmacy_staff' },
          ),
        )}
      />,
    );
    expect(await screen.findByTestId('rx-queue-plan-lock')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'View plans' })).toBeNull();
  });

  it('ignores view-plans when navigate is missing', async () => {
    const user = userEvent.setup();
    render(
      <RxMfe
        data={data(
          feature('queue', async () => ({
            ok: false,
            code: 'PLAN_FEATURE_LOCKED',
            formError: '',
          })),
        )}
      />,
    );
    await user.click(await screen.findByRole('button', { name: 'View plans' }));
    expect(screen.getByTestId('rx-queue-plan-lock')).toBeTruthy();
  });
});

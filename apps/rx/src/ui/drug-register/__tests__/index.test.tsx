import type { RxCommand, RxSubmitResult } from '@medmate/rx-contract';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  REGISTER_LIST,
  RETENTION,
  data,
  feature,
} from '../../../app/__tests__/helpers';
import RxMfe from '../../../app/RxMfe';

afterEach(() => {
  cleanup();
});

function registerSubmit(
  overrides: Partial<
    Record<RxCommand['action'], () => Promise<RxSubmitResult>>
  > = {},
) {
  return vi.fn(async (command: RxCommand): Promise<RxSubmitResult> => {
    const override = overrides[command.action];
    if (override) {
      return override();
    }
    if (command.action === 'loadRetention') {
      return RETENTION;
    }
    if (command.action === 'load') {
      return REGISTER_LIST;
    }
    return { ok: true };
  });
}

describe('DrugRegisterScreen', () => {
  it('lists rows, filters, and shows owner retention', async () => {
    const user = userEvent.setup();
    const onSubmit = registerSubmit();
    render(<RxMfe data={data(feature('drug-register', onSubmit))} />);
    expect(await screen.findByTestId('rx-register-table')).toBeTruthy();
    expect(screen.getByTestId('rx-retention-guidance')).toHaveTextContent(
      /two years/i,
    );
    await user.selectOptions(screen.getByLabelText('Schedule'), 'H1');
    expect(onSubmit).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /edit|delete/i })).toBeNull();
  });

  it('hides retention for staff and shows empty', async () => {
    const onSubmit = registerSubmit({
      load: async () => ({ ok: true, register: [], meta: { page: 1 } }),
    });
    render(
      <RxMfe
        data={data(
          feature('drug-register', onSubmit, {
            canViewRetention: false,
            role: 'pharmacy_staff',
          }),
        )}
      />,
    );
    expect(await screen.findByTestId('rx-register-empty')).toBeTruthy();
    expect(screen.queryByTestId('rx-retention-guidance')).toBeNull();
  });

  it('retries after a load error', async () => {
    const user = userEvent.setup();
    const onSubmit = registerSubmit({
      load: vi
        .fn()
        .mockResolvedValueOnce({ ok: false, formError: 'Down' })
        .mockResolvedValue(REGISTER_LIST),
    });
    render(<RxMfe data={data(feature('drug-register', onSubmit))} />);
    expect(await screen.findByTestId('rx-register-error')).toHaveTextContent(
      'Down',
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByTestId('rx-register-table')).toBeTruthy();
  });

  it('applies date filters and ignores failed retention', async () => {
    const user = userEvent.setup();
    const onSubmit = registerSubmit({
      loadRetention: async () => ({ ok: true }),
      load: async () => ({
        ok: true,
        register: [{ product_name: 'Crocin', quantity: 1 }],
        meta: { page: 1, has_next: false },
      }),
    });
    render(<RxMfe data={data(feature('drug-register', onSubmit))} />);
    await screen.findByTestId('rx-register-table');
    await user.type(screen.getByLabelText('From date'), '2026-08-01');
    await user.type(screen.getByLabelText('To date'), '2026-08-31');
    expect(onSubmit).toHaveBeenCalled();
    expect(screen.queryByTestId('rx-retention-guidance')).toBeNull();
  });
});

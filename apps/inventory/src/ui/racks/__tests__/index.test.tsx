import type {
  InventoryCommand,
  InventorySubmitResult,
} from '@medmate/inventory-contract';
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  RACKS,
  UNLOCATED,
  data,
  feature,
} from '../../../app/__tests__/helpers';
import InventoryMfe from '../../../app/InventoryMfe';
import { RACKS_COPY } from '../../../lib/copy';

afterEach(() => {
  cleanup();
});

function racksSubmit(
  overrides: Partial<
    Record<InventoryCommand['action'], () => Promise<InventorySubmitResult>>
  > = {},
) {
  return vi.fn(
    async (command: InventoryCommand): Promise<InventorySubmitResult> => {
      const override = overrides[command.action];
      if (override) {
        return override();
      }
      if (command.action === 'load') {
        return RACKS;
      }
      if (command.action === 'loadUnlocated') {
        return UNLOCATED;
      }
      return { ok: true };
    },
  );
}

describe('RacksScreen', () => {
  it('creates, assigns unlocated, prints, and deletes', async () => {
    const user = userEvent.setup();
    const onSubmit = racksSubmit();
    render(<InventoryMfe data={data(feature('racks', onSubmit))} />);
    expect(await screen.findByTestId('racks-table')).toBeTruthy();
    await user.type(screen.getByLabelText('Rack code'), 'B1');
    await user.type(screen.getByLabelText('Zone name'), 'Ground');
    await user.type(screen.getByLabelText('Description'), 'Back wall');
    await user.click(screen.getByRole('button', { name: 'Create rack' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some(
          (call) =>
            call[0].action === 'create' &&
            call[0].screen === 'racks' &&
            call[0].values.zone_name === 'Ground',
        ),
      ).toBe(true);
    });
    await user.selectOptions(screen.getByLabelText('Product'), 'prod-2');
    await user.selectOptions(screen.getByLabelText('Rack'), 'A1');
    await user.click(screen.getByRole('button', { name: 'Assign rack' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'assign'),
      ).toBe(true);
    });
    await user.click(screen.getByRole('button', { name: 'Print labels' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'printLabels'),
      ).toBe(true);
    });
    await user.click(screen.getByRole('button', { name: 'Delete rack' }));
    expect(screen.getByTestId('rack-delete-dialog')).toBeTruthy();
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByTestId('rack-delete-dialog')).toBeNull();
    });
    await user.click(screen.getByRole('button', { name: 'Delete rack' }));
    await user.click(screen.getByRole('button', { name: 'Keep rack' }));
    await waitFor(() => {
      expect(screen.queryByTestId('rack-delete-dialog')).toBeNull();
    });
    await user.click(screen.getByRole('button', { name: 'Delete rack' }));
    await user.click(
      within(screen.getByTestId('rack-delete-dialog')).getByRole('button', {
        name: 'Delete rack',
      }),
    );
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'delete'),
      ).toBe(true);
    });
  });

  it('shows empty create, duplicate error, and not-found', async () => {
    const user = userEvent.setup();
    const empty = racksSubmit({
      load: async () => ({ ok: true, racks: [] }),
      create: async () => ({
        ok: false,
        code: 'VALIDATION_ERROR',
        fieldErrors: { rack_code: 'Code already exists' },
      }),
    });
    render(<InventoryMfe data={data(feature('racks', empty))} />);
    expect(await screen.findByTestId('racks-empty')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Start with A1-01' }));
    expect(screen.getByLabelText('Rack code')).toHaveValue('A1-01');
    await user.click(screen.getByRole('button', { name: 'Create rack' }));
    expect(await screen.findByText(RACKS_COPY.zoneRequired)).toBeTruthy();
    await user.type(screen.getByLabelText('Zone name'), 'Counter');
    await user.click(screen.getByRole('button', { name: 'Create rack' }));
    expect(await screen.findByText('Code already exists')).toBeTruthy();

    cleanup();
    const missing = racksSubmit({
      load: async () => ({ ok: false, code: 'RACK_NOT_FOUND' }),
    });
    render(<InventoryMfe data={data(feature('racks', missing))} />);
    expect(await screen.findByTestId('rack-not-found')).toBeTruthy();
  });

  it('retries load errors and hides owner actions for staff', async () => {
    const user = userEvent.setup();
    const silent = racksSubmit({
      load: async () => ({ ok: false }),
    });
    render(<InventoryMfe data={data(feature('racks', silent))} />);
    expect(await screen.findByTestId('racks-error')).toHaveTextContent(
      'Unable to load racks.',
    );

    cleanup();
    const boom = racksSubmit({
      load: async () => ({ ok: false, formError: 'Down' }),
    });
    render(<InventoryMfe data={data(feature('racks', boom))} />);
    expect(await screen.findByTestId('racks-error')).toHaveTextContent('Down');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(
      boom.mock.calls.filter((call) => call[0].action === 'load').length,
    ).toBeGreaterThan(1);

    cleanup();
    const staff = racksSubmit();
    render(
      <InventoryMfe
        data={data(
          feature('racks', staff, {
            canManageRacks: false,
            canWrite: false,
            role: 'pharmacy_staff',
          }),
        )}
      />,
    );
    expect(await screen.findByTestId('racks-table')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Create rack' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Delete rack' })).toBeNull();

    cleanup();
    const emptyStaff = racksSubmit({
      load: async () => ({ ok: true }),
      loadUnlocated: async () => ({ ok: true }),
    });
    render(
      <InventoryMfe
        data={data(
          feature('racks', emptyStaff, {
            canManageRacks: false,
            canWrite: false,
            role: 'pharmacy_staff',
          }),
        )}
      />,
    );
    expect(await screen.findByTestId('racks-empty')).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: 'Start with A1-01' }),
    ).toBeNull();

    cleanup();
    const assignOnly = racksSubmit();
    render(
      <InventoryMfe
        data={data(
          feature('racks', assignOnly, {
            canManageRacks: false,
            canWrite: true,
          }),
        )}
      />,
    );
    expect(await screen.findByTestId('assign-unlocated')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Create rack' })).toBeNull();

    cleanup();
    const manageOnly = racksSubmit();
    render(
      <InventoryMfe
        data={data(
          feature('racks', manageOnly, {
            canManageRacks: true,
            canWrite: false,
          }),
        )}
      />,
    );
    expect(
      await screen.findByRole('button', { name: 'Create rack' }),
    ).toBeTruthy();
    expect(screen.queryByTestId('assign-unlocated')).toBeNull();
  });

  it('surfaces assign and delete failures', async () => {
    const user = userEvent.setup();
    const onSubmit = racksSubmit({
      assign: async () => ({ ok: false, formError: 'Cannot assign' }),
      delete: async () => ({ ok: false, code: 'FORBIDDEN' }),
    });
    render(<InventoryMfe data={data(feature('racks', onSubmit))} />);
    await user.selectOptions(await screen.findByLabelText('Product'), 'prod-2');
    await user.selectOptions(screen.getByLabelText('Rack'), 'A1');
    await user.click(screen.getByRole('button', { name: 'Assign rack' }));
    expect(await screen.findByTestId('racks-form-error')).toHaveTextContent(
      'Cannot assign',
    );
    await user.click(screen.getByRole('button', { name: 'Delete rack' }));
    await user.click(
      within(screen.getByTestId('rack-delete-dialog')).getByRole('button', {
        name: 'Delete rack',
      }),
    );
    expect(await screen.findByTestId('racks-error')).toHaveTextContent(
      'FORBIDDEN',
    );

    cleanup();
    const gaps = racksSubmit({
      load: async () => ({
        ok: true,
        racks: [{ rack_code: 'C1' }],
      }),
      loadUnlocated: async () => ({ ok: true }),
      create: async () => ({ ok: false, code: 'VALIDATION_ERROR' }),
    });
    render(<InventoryMfe data={data(feature('racks', gaps))} />);
    expect(await screen.findByTestId('rack-row-C1')).toHaveTextContent('—');
    await user.type(screen.getByLabelText('Rack code'), 'D1');
    await user.type(screen.getByLabelText('Zone name'), 'Back');
    await user.click(screen.getByRole('button', { name: 'Create rack' }));
    expect(await screen.findByTestId('racks-form-error')).toHaveTextContent(
      'VALIDATION_ERROR',
    );

    cleanup();
    const assignCode = racksSubmit({
      assign: async () => ({ ok: false, code: 'VALIDATION_ERROR' }),
    });
    render(<InventoryMfe data={data(feature('racks', assignCode))} />);
    await user.selectOptions(await screen.findByLabelText('Product'), 'prod-2');
    await user.selectOptions(screen.getByLabelText('Rack'), 'A1');
    await user.click(screen.getByRole('button', { name: 'Assign rack' }));
    expect(await screen.findByTestId('racks-form-error')).toHaveTextContent(
      'VALIDATION_ERROR',
    );
  });
});

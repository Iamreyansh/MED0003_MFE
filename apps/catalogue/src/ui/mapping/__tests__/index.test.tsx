import type {
  CatalogueCommand,
  CatalogueSubmitResult,
} from '@medmate/catalogue-contract';
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature, MAPPING_ROWS } from '../../../app/__tests__/helpers';
import CatalogueMfe from '../../../app/CatalogueMfe';

afterEach(() => {
  cleanup();
});

function mappingSubmit(
  overrides: Partial<
    Record<CatalogueCommand['action'], () => Promise<CatalogueSubmitResult>>
  > = {},
) {
  return vi.fn(
    async (command: CatalogueCommand): Promise<CatalogueSubmitResult> => {
      const override = overrides[command.action];
      if (override) {
        return override();
      }
      if (command.action === 'load') {
        return MAPPING_ROWS;
      }
      return { ok: true };
    },
  );
}

describe('MappingScreen', () => {
  it('lists rows, edits, and confirms delete', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const onSubmit = mappingSubmit();
    render(
      <CatalogueMfe
        data={data(feature('mapping', onSubmit), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    expect(await screen.findByTestId('mapping-table')).toBeTruthy();
    expect(screen.getByTestId('mapping-stock-note')).toHaveTextContent(
      'batch inventory',
    );
    await user.click(screen.getByRole('button', { name: 'Open inventory' }));
    expect(onNavigate).toHaveBeenCalledWith('/inventory');
    await user.click(screen.getByRole('button', { name: 'Edit mapping' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    await user.clear(screen.getByLabelText('Pharmacy price (₹)'));
    await user.type(screen.getByLabelText('Pharmacy price (₹)'), '210');
    await user.click(screen.getByLabelText('Visible on online storefront'));
    await user.click(screen.getByRole('button', { name: 'Save mapping' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'update'),
      ).toBe(true);
    });
    await waitFor(() => {
      expect(screen.queryByTestId('mapping-drawer')).toBeNull();
    });
    await user.click(screen.getByRole('button', { name: 'Delete mapping' }));
    expect(screen.getByTestId('mapping-delete-dialog')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Keep mapping' }));
    await waitFor(() => {
      expect(screen.queryByTestId('mapping-delete-dialog')).toBeNull();
    });
    await user.click(screen.getByRole('button', { name: 'Delete mapping' }));
    await user.click(
      within(screen.getByTestId('mapping-delete-dialog')).getByRole('button', {
        name: 'Delete mapping',
      }),
    );
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'delete'),
      ).toBe(true);
    });
  });

  it('creates from a deep link and surfaces PRICE_ABOVE_MRP', async () => {
    const user = userEvent.setup();
    const onSubmit = mappingSubmit({
      create: async () => ({
        ok: false,
        code: 'PRICE_ABOVE_MRP',
        formError: 'pharmacy_price exceeds master MRP',
      }),
    });
    render(
      <CatalogueMfe
        data={data(
          feature('mapping', onSubmit, {
            createFromMedicineId: '11111111-2222-4333-8444-555555555555',
          }),
        )}
      />,
    );
    expect(await screen.findByRole('dialog')).toBeTruthy();
    expect(screen.getByLabelText('Master medicine ID')).toHaveValue(
      '11111111-2222-4333-8444-555555555555',
    );
    await user.type(screen.getByLabelText('Pharmacy price (₹)'), '999');
    await user.type(screen.getByLabelText('Mapping stock quantity'), '1');
    await user.click(screen.getByRole('button', { name: 'Save mapping' }));
    expect(await screen.findByTestId('mapping-form-error')).toHaveTextContent(
      'exceeds master MRP',
    );
  });

  it('surfaces Schedule X and hides owner actions for staff', async () => {
    const user = userEvent.setup();
    const onSubmit = mappingSubmit({
      update: async () => ({
        ok: false,
        code: 'SCHEDULE_X_NOT_AVAILABLE_ONLINE',
        formError:
          'Schedule X medicines are not available for online storefront',
      }),
    });
    render(<CatalogueMfe data={data(feature('mapping', onSubmit))} />);
    await user.click(
      await screen.findByRole('button', { name: 'Edit mapping' }),
    );
    await user.click(screen.getByRole('button', { name: 'Save mapping' }));
    expect(await screen.findByTestId('mapping-form-error')).toHaveTextContent(
      'Schedule X',
    );
    await user.click(screen.getByRole('button', { name: 'Close' }));

    cleanup();
    const staff = mappingSubmit();
    render(
      <CatalogueMfe
        data={data(
          feature('mapping', staff, {
            canCreate: false,
            canDelete: false,
            role: 'pharmacy_staff',
          }),
        )}
      />,
    );
    expect(await screen.findByTestId('mapping-table')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Map a medicine' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Delete mapping' })).toBeNull();
    expect(screen.getByText(/Staff can edit/)).toBeTruthy();
  });

  it('shows empty CTA, load retry, create success, and delete failure', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const empty = mappingSubmit({
      load: async () => ({ ok: true }),
    });
    render(
      <CatalogueMfe
        data={data(feature('mapping', empty), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    expect(await screen.findByTestId('mapping-empty')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Search catalogue' }));
    expect(onNavigate).toHaveBeenCalledWith('/catalogue');
    await user.click(screen.getByRole('button', { name: 'Map a medicine' }));
    await user.type(
      screen.getByLabelText('Master medicine ID'),
      '11111111-2222-4333-8444-555555555555',
    );
    await user.type(screen.getByLabelText('Pharmacy price (₹)'), '20');
    await user.type(screen.getByLabelText('Mapping stock quantity'), '2');
    await user.click(screen.getByRole('button', { name: 'Save mapping' }));
    await waitFor(() => {
      expect(empty.mock.calls.some((call) => call[0].action === 'create')).toBe(
        true,
      );
    });

    cleanup();
    const failed = mappingSubmit({
      load: async () => ({
        ok: false,
        code: 'UNAUTHORIZED',
        formError: 'Sign in again',
      }),
    });
    render(<CatalogueMfe data={data(feature('mapping', failed))} />);
    expect(await screen.findByTestId('mapping-error')).toHaveTextContent(
      'Sign in again',
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(
      failed.mock.calls.filter((call) => call[0].action === 'load').length,
    ).toBeGreaterThan(1);

    cleanup();
    const deleteFail = mappingSubmit({
      delete: async () => ({
        ok: false,
        code: 'FORBIDDEN',
      }),
    });
    render(<CatalogueMfe data={data(feature('mapping', deleteFail))} />);
    await user.click(
      await screen.findByRole('button', { name: 'Delete mapping' }),
    );
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByTestId('mapping-delete-dialog')).toBeNull();
    });
    await user.click(screen.getByRole('button', { name: 'Delete mapping' }));
    await user.click(
      within(screen.getByTestId('mapping-delete-dialog')).getByRole('button', {
        name: 'Delete mapping',
      }),
    );
    expect(await screen.findByTestId('mapping-error')).toHaveTextContent(
      'FORBIDDEN',
    );
  });

  it('covers fallback errors, hidden rows, and empty create save', async () => {
    const user = userEvent.setup();
    const onSubmit = mappingSubmit({
      load: async () => ({
        ok: true,
        mappings: [
          {
            mapping_id: 'map-hidden',
            master_medicine_id: 'med-x',
            medicine_name: 'Morphine',
            schedule: 'X',
            is_visible: false,
          },
        ],
        meta: { page: 1, has_next: true },
      }),
      create: async () => ({
        ok: false,
        code: 'PRICE_ABOVE_MRP',
      }),
      update: async () => ({
        ok: false,
        code: 'PRICE_ABOVE_MRP',
        fieldErrors: { pharmacy_price: 'Too high' },
      }),
    });
    render(<CatalogueMfe data={data(feature('mapping', onSubmit))} />);
    expect(await screen.findByText('Hidden')).toBeTruthy();
    expect(screen.getByText('Morphine')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    await user.click(screen.getByRole('button', { name: 'Map a medicine' }));
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByTestId('mapping-drawer')).toBeNull();
    });
    await user.click(screen.getByRole('button', { name: 'Map a medicine' }));
    await user.click(screen.getByRole('button', { name: 'Save mapping' }));
    expect(await screen.findByTestId('mapping-form-error')).toHaveTextContent(
      'Enter a master medicine ID',
    );
    await user.type(screen.getByLabelText('Master medicine ID'), '1');
    await user.click(screen.getByRole('button', { name: 'Save mapping' }));
    expect(await screen.findByText(/UUID from catalogue search/)).toBeTruthy();
    await user.clear(screen.getByLabelText('Master medicine ID'));
    await user.type(
      screen.getByLabelText('Master medicine ID'),
      '11111111-2222-4333-8444-555555555555',
    );
    await user.type(screen.getByLabelText('Pharmacy price (₹)'), '9');
    await user.type(screen.getByLabelText('Mapping stock quantity'), '1');
    await user.click(screen.getByRole('button', { name: 'Save mapping' }));
    expect(await screen.findByText('Price cannot exceed MRP.')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.click(screen.getByRole('button', { name: 'Edit mapping' }));
    await user.click(screen.getByRole('button', { name: 'Save mapping' }));
    expect(await screen.findByText('Too high')).toBeTruthy();
  });

  it('uses code fallbacks when Core omits messages', async () => {
    const user = userEvent.setup();
    const onSubmit = mappingSubmit({
      load: async () => ({ ok: false, code: 'UNAUTHORIZED' }),
      update: async () => ({
        ok: false,
        code: 'SCHEDULE_X_NOT_AVAILABLE_ONLINE',
      }),
    });
    render(<CatalogueMfe data={data(feature('mapping', onSubmit))} />);
    expect(await screen.findByTestId('mapping-error')).toHaveTextContent(
      'UNAUTHORIZED',
    );
    cleanup();
    const blank = mappingSubmit({
      load: async () => ({ ok: false }),
    });
    render(<CatalogueMfe data={data(feature('mapping', blank))} />);
    expect(await screen.findByTestId('mapping-error')).toHaveTextContent(
      'Unable to load mappings.',
    );
    cleanup();
    const updateOnly = mappingSubmit({
      update: async () => ({
        ok: false,
        code: 'SCHEDULE_X_NOT_AVAILABLE_ONLINE',
      }),
    });
    render(<CatalogueMfe data={data(feature('mapping', updateOnly))} />);
    await user.click(
      await screen.findByRole('button', { name: 'Edit mapping' }),
    );
    await user.click(screen.getByRole('button', { name: 'Save mapping' }));
    expect(await screen.findByTestId('mapping-form-error')).toHaveTextContent(
      'Schedule X medicines cannot be sold online.',
    );
  });

  it('hides edit when patch is disabled and paginates', async () => {
    const user = userEvent.setup();
    const onSubmit = mappingSubmit({
      load: async () => ({
        ok: true,
        mappings: MAPPING_ROWS.ok ? MAPPING_ROWS.mappings : [],
        meta: { page: 1, has_next: true },
      }),
    });
    render(
      <CatalogueMfe
        data={data(feature('mapping', onSubmit, { canPatch: false }))}
      />,
    );
    expect(await screen.findByTestId('mapping-table')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Edit mapping' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some(
          (call) => call[0].action === 'load' && call[0].values?.page === 2,
        ),
      ).toBe(true);
    });
  });
});

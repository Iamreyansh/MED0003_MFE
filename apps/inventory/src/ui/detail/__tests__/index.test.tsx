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
  BATCHES,
  PRODUCT,
  data,
  feature,
} from '../../../app/__tests__/helpers';
import InventoryMfe from '../../../app/InventoryMfe';

afterEach(() => {
  cleanup();
});

function detailSubmit(
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
        return PRODUCT;
      }
      if (command.action === 'loadBatches') {
        return BATCHES;
      }
      return { ok: true };
    },
  );
}

describe('DetailScreen', () => {
  it('loads batches, adds, adjusts, and confirms write-off', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit();
    render(<InventoryMfe data={data(feature('detail', onSubmit))} />);
    expect(await screen.findByTestId('batches-table')).toBeTruthy();
    expect(screen.getByTestId('batch-row-batch-1')).toHaveTextContent('B1');
    await user.type(screen.getByLabelText('Batch number'), 'B2');
    await user.type(screen.getByLabelText('Batch quantity'), '4');
    await user.click(screen.getByRole('button', { name: 'Add batch' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'addBatch'),
      ).toBe(true);
    });
    await user.click(screen.getByRole('button', { name: 'Adjust quantity' }));
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByLabelText('Adjusted quantity')).toBeNull();
    });
    await user.click(screen.getByRole('button', { name: 'Adjust quantity' }));
    await user.clear(screen.getByLabelText('Adjusted quantity'));
    await user.type(screen.getByLabelText('Adjusted quantity'), '8');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'adjustBatch'),
      ).toBe(true);
    });
    await user.click(screen.getByRole('button', { name: 'Write off' }));
    expect(screen.getByTestId('writeoff-dialog')).toBeTruthy();
    await user.type(screen.getByLabelText('Write-off reason'), 'damaged');
    await user.click(
      within(screen.getByTestId('writeoff-dialog')).getByRole('button', {
        name: 'Write off',
      }),
    );
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'writeOff'),
      ).toBe(true);
    });
  });

  it('locks Free online toggle and restores a failed Growth patch', async () => {
    const user = userEvent.setup();
    const locked = detailSubmit();
    render(
      <InventoryMfe
        data={data(
          feature('detail', locked, {
            canToggleOnline: false,
            plan: 'FREE',
          }),
        )}
      />,
    );
    await user.click(await screen.findByLabelText('List on online storefront'));
    expect(screen.getByTestId('online-lock')).toHaveTextContent('Growth');
    expect(
      locked.mock.calls.some((call) => call[0].action === 'patchProduct'),
    ).toBe(false);

    cleanup();
    const failing = detailSubmit({
      patchProduct: async () => ({
        ok: false,
        code: 'PLAN_FEATURE_LOCKED',
        formError: 'Upgrade required',
      }),
    });
    render(<InventoryMfe data={data(feature('detail', failing))} />);
    await user.click(await screen.findByLabelText('List on online storefront'));
    expect(await screen.findByTestId('online-lock')).toBeTruthy();
    expect(
      screen.getByLabelText('List on online storefront'),
    ).not.toBeChecked();
  });

  it('shows not-found, storefront hint, and pharmacist without add', async () => {
    const missing = detailSubmit({
      load: async () => ({ ok: false, code: 'PRODUCT_NOT_FOUND' }),
    });
    render(<InventoryMfe data={data(feature('detail', missing))} />);
    expect(await screen.findByTestId('inventory-not-found')).toBeTruthy();

    cleanup();
    const hint = detailSubmit({
      load: async () => ({
        ok: true,
        product: {
          product_id: 'prod-1',
          name: 'Crocin',
          is_online_visible: true,
        },
      }),
    });
    render(
      <InventoryMfe
        data={data(
          feature('detail', hint, {
            storefrontOnline: false,
          }),
        )}
      />,
    );
    expect(await screen.findByTestId('storefront-offline-hint')).toBeTruthy();

    cleanup();
    const readOnly = detailSubmit();
    render(
      <InventoryMfe
        data={data(
          feature('detail', readOnly, {
            canWrite: false,
            canWriteOff: false,
            canPatchDetails: false,
            role: 'pharmacy_staff',
          }),
        )}
      />,
    );
    expect(await screen.findByTestId('batches-table')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Add batch' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Write off' })).toBeNull();

    cleanup();
    const rackOnly = detailSubmit();
    render(
      <InventoryMfe
        data={data(
          feature('detail', rackOnly, {
            canPatchDetails: false,
          }),
        )}
      />,
    );
    expect(
      await screen.findByRole('button', { name: 'Save rack' }),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Save details' })).toBeNull();

    cleanup();
    const detailsOnly = detailSubmit();
    render(
      <InventoryMfe
        data={data(
          feature('detail', detailsOnly, {
            canWrite: false,
            canWriteOff: false,
            canPatchDetails: true,
          }),
        )}
      />,
    );
    expect(
      await screen.findByRole('button', { name: 'Save details' }),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Save rack' })).toBeNull();
  });

  it('saves details and rack, and surfaces adjust validation', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit({
      patchDetails: async () => ({
        ok: true,
        product: {
          product_id: 'prod-1',
          name: 'Crocin',
          allow_loose_selling: true,
          reorder_level: 5,
        },
      }),
      patchRack: async () => ({
        ok: true,
        product: {
          product_id: 'prod-1',
          name: 'Crocin',
          rack_location_code: 'B2',
        },
      }),
      adjustBatch: async () => ({
        ok: false,
        code: 'VALIDATION_ERROR',
        fieldErrors: { quantity: 'Must be positive' },
      }),
    });
    render(<InventoryMfe data={data(feature('detail', onSubmit))} />);
    await user.click(await screen.findByLabelText('Allow loose selling'));
    await user.click(screen.getByRole('button', { name: 'Save details' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'patchDetails'),
      ).toBe(true);
    });
    await user.clear(screen.getByLabelText('Rack location code'));
    await user.type(screen.getByLabelText('Rack location code'), 'B2');
    await user.click(screen.getByRole('button', { name: 'Save rack' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'patchRack'),
      ).toBe(true);
    });
    await user.click(screen.getByRole('button', { name: 'Adjust quantity' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findAllByText('Must be positive')).not.toHaveLength(0);
  });

  it('covers load errors, local qty validation, and failed writes', async () => {
    const user = userEvent.setup();
    render(
      <InventoryMfe
        data={data(
          feature('detail', async () => ({ ok: true }), { productId: '' }),
        )}
      />,
    );
    expect(await screen.findByTestId('inventory-not-found')).toBeTruthy();

    cleanup();
    const codeOnly = detailSubmit({
      load: async () => ({ ok: false }),
      loadBatches: async () => ({ ok: false }),
    });
    render(<InventoryMfe data={data(feature('detail', codeOnly))} />);
    expect(await screen.findByTestId('detail-error')).toHaveTextContent(
      'Unable to load product.',
    );

    cleanup();
    const emptyProduct = detailSubmit({
      load: async () => ({ ok: true }),
    });
    render(<InventoryMfe data={data(feature('detail', emptyProduct))} />);
    expect(await screen.findByTestId('batches-table')).toBeTruthy();

    cleanup();
    const boom = detailSubmit({
      load: async () => ({ ok: false, formError: 'Down' }),
      addBatch: async () => ({ ok: false, formError: 'No' }),
      writeOff: async () => ({ ok: false, code: 'STAFF_CANNOT_WRITE_OFF' }),
      patchProduct: async () => ({
        ok: true,
        product: {
          product_id: 'prod-1',
          name: 'Crocin',
          is_online_visible: true,
        },
      }),
      patchDetails: async () => ({ ok: false, formError: 'Details locked' }),
      patchRack: async () => ({ ok: false, formError: 'Rack missing' }),
    });
    render(<InventoryMfe data={data(feature('detail', boom))} />);
    expect(await screen.findByTestId('detail-error')).toHaveTextContent('Down');
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    cleanup();
    const happy = detailSubmit({
      addBatch: async () => ({ ok: false, formError: 'No' }),
      writeOff: async () => ({ ok: false, code: 'STAFF_CANNOT_WRITE_OFF' }),
      patchProduct: async () => ({
        ok: true,
        product: {
          product_id: 'prod-1',
          name: 'Crocin',
          is_online_visible: true,
        },
      }),
      patchDetails: async () => ({ ok: false, formError: 'Details locked' }),
      patchRack: async () => ({ ok: false, formError: 'Rack missing' }),
    });
    render(<InventoryMfe data={data(feature('detail', happy))} />);
    await user.click(await screen.findByLabelText('List on online storefront'));
    await waitFor(() => {
      expect(
        happy.mock.calls.some((call) => call[0].action === 'patchProduct'),
      ).toBe(true);
    });
    await user.click(screen.getByRole('button', { name: 'Add batch' }));
    expect(
      await screen.findAllByText('Enter a non-negative quantity.'),
    ).not.toHaveLength(0);
    await user.type(screen.getByLabelText('Batch quantity'), '2');
    await user.click(screen.getByRole('button', { name: 'Add batch' }));
    expect(await screen.findByTestId('detail-form-error')).toHaveTextContent(
      'No',
    );
    await user.click(screen.getByRole('button', { name: 'Save details' }));
    expect(await screen.findByTestId('detail-form-error')).toHaveTextContent(
      'Details locked',
    );
    await user.click(screen.getByRole('button', { name: 'Save rack' }));
    expect(await screen.findByTestId('detail-form-error')).toHaveTextContent(
      'Rack missing',
    );
    await user.click(screen.getByRole('button', { name: 'Adjust quantity' }));
    await user.clear(screen.getByLabelText('Adjusted quantity'));
    await user.type(screen.getByLabelText('Adjusted quantity'), '-1');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(
      screen.getAllByText('Enter a non-negative quantity.'),
    ).not.toHaveLength(0);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.click(screen.getByRole('button', { name: 'Write off' }));
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByTestId('writeoff-dialog')).toBeNull();
    });
    await user.click(screen.getByRole('button', { name: 'Write off' }));
    await user.click(screen.getByRole('button', { name: 'Keep batch' }));
    await waitFor(() => {
      expect(screen.queryByTestId('writeoff-dialog')).toBeNull();
    });
    await user.click(screen.getByRole('button', { name: 'Write off' }));
    await user.click(
      within(screen.getByTestId('writeoff-dialog')).getByRole('button', {
        name: 'Write off',
      }),
    );
    expect(await screen.findByTestId('detail-form-error')).toHaveTextContent(
      'STAFF_CANNOT_WRITE_OFF',
    );
  });

  it('opens adjust for a batch without quantity', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit({
      loadBatches: async () => ({
        ok: true,
        batches: [{ batch_id: 'bare' }],
      }),
    });
    render(<InventoryMfe data={data(feature('detail', onSubmit))} />);
    await user.click(
      await screen.findByRole('button', { name: 'Adjust quantity' }),
    );
    expect(screen.getByLabelText('Adjusted quantity')).toHaveDisplayValue('');
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.click(screen.getByRole('button', { name: 'Write off' }));
    expect(screen.getByLabelText('Write-off quantity')).toHaveDisplayValue('');
  });

  it('covers code-only failures and optional write-off fields', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit({
      addBatch: async () => ({ ok: false, code: 'VALIDATION_ERROR' }),
      adjustBatch: async () => ({ ok: false, code: 'BATCH_NOT_FOUND' }),
      patchRack: async () => ({
        ok: true,
        product: { product_id: 'prod-1', name: 'Crocin' },
      }),
      writeOff: async () => ({ ok: false, formError: 'Blocked' }),
    });
    render(<InventoryMfe data={data(feature('detail', onSubmit))} />);
    await user.type(await screen.findByLabelText('Expiry date'), '2027-01-01');
    await user.type(screen.getByLabelText('Reorder level'), '3');
    await user.type(screen.getByLabelText('Batch quantity'), '1');
    await user.click(screen.getByRole('button', { name: 'Add batch' }));
    expect(await screen.findByTestId('detail-form-error')).toHaveTextContent(
      'VALIDATION_ERROR',
    );
    await user.click(screen.getByRole('button', { name: 'Save rack' }));
    await user.click(screen.getByRole('button', { name: 'Adjust quantity' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByTestId('detail-form-error')).toHaveTextContent(
      'BATCH_NOT_FOUND',
    );
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.click(screen.getByRole('button', { name: 'Write off' }));
    await user.clear(screen.getByLabelText('Write-off quantity'));
    await user.click(
      within(screen.getByTestId('writeoff-dialog')).getByRole('button', {
        name: 'Write off',
      }),
    );
    expect(await screen.findByTestId('detail-form-error')).toHaveTextContent(
      'Blocked',
    );

    cleanup();
    const extras = detailSubmit({
      patchProduct: async () => ({ ok: true }),
      patchDetails: async () => ({ ok: false, code: 'VALIDATION_ERROR' }),
    });
    render(<InventoryMfe data={data(feature('detail', extras))} />);
    await user.click(await screen.findByLabelText('List on online storefront'));
    await user.clear(screen.getByLabelText('Reorder level'));
    await user.click(screen.getByRole('button', { name: 'Save details' }));
    expect(await screen.findByTestId('detail-form-error')).toHaveTextContent(
      'VALIDATION_ERROR',
    );

    cleanup();
    const server = detailSubmit({
      patchProduct: async () => ({ ok: false, code: 'INTERNAL_ERROR' }),
    });
    render(<InventoryMfe data={data(feature('detail', server))} />);
    await user.click(await screen.findByLabelText('List on online storefront'));
    expect(await screen.findByTestId('detail-form-error')).toHaveTextContent(
      'INTERNAL_ERROR',
    );

    cleanup();
    const gaps = detailSubmit({
      loadBatches: async () => ({ ok: true }),
      patchRack: async () => ({ ok: false, code: 'RACK_NOT_FOUND' }),
    });
    render(
      <InventoryMfe
        data={data(feature('detail', gaps, { productId: null }))}
      />,
    );
    expect(await screen.findByTestId('inventory-not-found')).toBeTruthy();

    cleanup();
    render(<InventoryMfe data={data(feature('detail', gaps))} />);
    await user.click(await screen.findByRole('button', { name: 'Save rack' }));
    expect(await screen.findByTestId('detail-form-error')).toHaveTextContent(
      'RACK_NOT_FOUND',
    );
  });
});

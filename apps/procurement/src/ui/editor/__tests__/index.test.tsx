import type {
  ProcurementCommand,
  ProcurementSubmitResult,
} from '@medmate/procurement-contract';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GRN_DETAIL, data, feature } from '../../../app/__tests__/helpers';
import ProcurementMfe from '../../../app/ProcurementMfe';

afterEach(() => {
  cleanup();
});

function editorSubmit(
  overrides: Partial<
    Record<ProcurementCommand['action'], () => Promise<ProcurementSubmitResult>>
  > = {},
) {
  return vi.fn(
    async (command: ProcurementCommand): Promise<ProcurementSubmitResult> => {
      const override = overrides[command.action];
      if (override) {
        return override();
      }
      if (command.action === 'load') {
        return GRN_DETAIL;
      }
      return { ok: true, item: { item_id: 'item-2', quantity: 5 } };
    },
  );
}

describe('EditorScreen', () => {
  it('adds, patches, and deletes a line then stocks', async () => {
    const user = userEvent.setup();
    const onSubmit = editorSubmit();
    render(<ProcurementMfe data={data(feature('editor', onSubmit))} />);
    expect(await screen.findByTestId('grn-items')).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Product' })).toBeTruthy();
    await user.type(screen.getByLabelText('Product id'), 'prod-2');
    await user.type(screen.getByLabelText('Paid quantity'), '5');
    await user.click(screen.getByRole('button', { name: 'Add line' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'addItem'),
      ).toBe(true);
    });
    await user.click(screen.getByRole('button', { name: 'Save quantity' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'patchItem'),
      ).toBe(true);
    });
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'deleteItem'),
      ).toBe(true);
    });
    await user.click(screen.getByRole('button', { name: 'Save and stock' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'saveAndStock'),
      ).toBe(true);
    });
  });

  it('shows not-found and hides stock for staff', async () => {
    render(
      <ProcurementMfe
        data={data(
          feature(
            'editor',
            async () => ({ ok: false, code: 'GRN_NOT_FOUND' }),
            { grnId: 'missing' },
          ),
        )}
      />,
    );
    expect(await screen.findByTestId('procurement-not-found')).toBeTruthy();

    render(
      <ProcurementMfe
        data={data(
          feature('editor', async () => GRN_DETAIL, {
            canStockIn: false,
            role: 'pharmacy_staff',
          }),
        )}
      />,
    );
    expect(await screen.findByTestId('grn-items')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Save and stock' })).toBeNull();
  });

  it('covers load retry, validation, and mutation errors', async () => {
    const user = userEvent.setup();
    const onSubmit = editorSubmit({
      load: async () => ({ ok: false, formError: 'Unable to load receipt.' }),
      addItem: async () => ({ ok: false, formError: 'Add failed' }),
      patchItem: async () => ({ ok: false, code: 'VALIDATION_ERROR' }),
      deleteItem: async () => ({ ok: false, formError: 'Delete failed' }),
      saveAndStock: async () => ({ ok: false, code: 'STAFF_CANNOT_STOCK' }),
    });
    const { rerender } = render(
      <ProcurementMfe data={data(feature('editor', onSubmit))} />,
    );
    expect(await screen.findByTestId('editor-error')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    rerender(
      <ProcurementMfe
        data={data(
          feature('editor', editorSubmit(), { grnId: null, canWrite: false }),
        )}
      />,
    );
    expect(await screen.findByTestId('procurement-not-found')).toBeTruthy();

    const failing = editorSubmit({
      addItem: async () => ({ ok: false, code: 'VALIDATION_ERROR' }),
      patchItem: async () => ({ ok: false, code: 'VALIDATION_ERROR' }),
      deleteItem: async () => ({ ok: false, code: 'FORBIDDEN' }),
      saveAndStock: async () => ({ ok: false, code: 'STAFF_CANNOT_STOCK' }),
    });
    rerender(<ProcurementMfe data={data(feature('editor', failing))} />);
    await screen.findByTestId('grn-items');
    await user.click(screen.getByRole('button', { name: 'Add line' }));
    expect(await screen.findByTestId('editor-form-error')).toHaveTextContent(
      'non-negative',
    );
    await user.type(screen.getByLabelText('Paid quantity'), '2');
    await user.click(screen.getByRole('button', { name: 'Add line' }));
    expect(await screen.findByTestId('editor-form-error')).toHaveTextContent(
      'VALIDATION_ERROR',
    );
    await user.clear(screen.getByLabelText('Line quantity'));
    await user.click(screen.getByRole('button', { name: 'Save quantity' }));
    expect(await screen.findByTestId('editor-form-error')).toHaveTextContent(
      'non-negative',
    );
    await user.type(screen.getByLabelText('Line quantity'), '3');
    await user.click(screen.getByRole('button', { name: 'Save quantity' }));
    expect(await screen.findByTestId('editor-form-error')).toHaveTextContent(
      'VALIDATION_ERROR',
    );
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(await screen.findByTestId('editor-form-error')).toHaveTextContent(
      'FORBIDDEN',
    );
    await user.click(screen.getByRole('button', { name: 'Save and stock' }));
    expect(await screen.findByTestId('editor-form-error')).toHaveTextContent(
      'STAFF_CANNOT_STOCK',
    );
  });

  it('hides write controls for read-only staff', async () => {
    render(
      <ProcurementMfe
        data={data(
          feature('editor', async () => GRN_DETAIL, {
            canWrite: false,
            canStockIn: false,
          }),
        )}
      />,
    );
    expect(await screen.findByTestId('grn-items')).toBeTruthy();
    expect(screen.queryByLabelText('Paid quantity')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Add line' })).toBeNull();
  });

  it('renders header fallbacks without invoice or totals', async () => {
    render(
      <ProcurementMfe
        data={data(
          feature('editor', async () => ({
            ok: true,
            grn: {
              grn_id: 'grn-bare',
              items: [{ item_id: 'item-1', quantity: 1 }],
            },
          })),
        )}
      />,
    );
    expect(await screen.findByTestId('grn-header')).toHaveTextContent(
      'grn-bare',
    );
    expect(screen.getByTestId('grn-item-item-1')).toBeTruthy();
  });

  it('types every add-item field and maps a load-code error', async () => {
    const user = userEvent.setup();
    const onSubmit = editorSubmit({
      load: async () => ({
        ok: true,
        grn: {
          grn_id: 'grn-1',
          items: [{ item_id: 'item-bare' }],
        },
      }),
    });
    const { rerender } = render(
      <ProcurementMfe data={data(feature('editor', onSubmit))} />,
    );
    await screen.findByTestId('grn-items');
    await user.type(screen.getByLabelText('Product id'), 'prod-2');
    await user.type(screen.getByLabelText('Batch number'), 'B9');
    await user.type(screen.getByLabelText('Expiry date'), '2027-06-30');
    await user.type(screen.getByLabelText('Paid quantity'), '4');
    await user.clear(screen.getByLabelText('Free quantity'));
    await user.type(screen.getByLabelText('Purchase price'), '13');
    await user.type(screen.getByLabelText('MRP'), '22');
    await user.type(screen.getByLabelText('GST %'), '12');
    await user.click(screen.getByRole('button', { name: 'Add line' }));
    await user.type(screen.getByLabelText('Line quantity'), '8');

    rerender(
      <ProcurementMfe
        data={data(
          feature('editor', async () => ({ ok: false, code: 'FORBIDDEN' })),
        )}
      />,
    );
    expect(await screen.findByTestId('editor-error')).toHaveTextContent(
      'FORBIDDEN',
    );
  });

  it('keeps STOCKED lines read-only and links to inventory', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <ProcurementMfe
        data={data(
          feature('editor', async () => ({
            ok: true,
            grn: {
              grn_id: 'grn-1',
              invoice_number: 'INV-1',
              status: 'STOCKED',
              items: [
                {
                  item_id: 'item-1',
                  product_id: 'prod-1',
                  product_name: 'Crocin',
                  quantity: 10,
                  line_total: 100,
                },
              ],
            },
          })),
          { capabilities: { navigate: onNavigate } },
        )}
      />,
    );
    expect(await screen.findByTestId('grn-stocked')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Open product' }));
    expect(onNavigate).toHaveBeenCalledWith('/inventory/prod-1');
  });
});

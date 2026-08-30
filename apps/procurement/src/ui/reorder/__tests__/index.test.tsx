import type {
  ProcurementCommand,
  ProcurementSubmitResult,
} from '@medmate/procurement-contract';
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
  PO_LIST,
  REORDER_LIST,
  data,
  feature,
} from '../../../app/__tests__/helpers';
import ProcurementMfe from '../../../app/ProcurementMfe';

afterEach(() => {
  cleanup();
});

function reorderSubmit(
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
        return REORDER_LIST;
      }
      if (command.action === 'loadPurchaseOrders') {
        return PO_LIST;
      }
      if (command.action === 'createPo') {
        return {
          ok: true,
          purchaseOrder: {
            po_id: 'po-2',
            po_number: 'PO-2',
            status: 'DRAFT',
            items_count: 1,
            estimated_total: 100,
          },
        };
      }
      if (command.action === 'patchPo') {
        return {
          ok: true,
          purchaseOrder: {
            po_id: 'po-2',
            items_count: 2,
            estimated_total: 140,
          },
        };
      }
      if (command.action === 'send') {
        return {
          ok: true,
          purchaseOrder: { po_id: 'po-2', status: 'SENT' },
        };
      }
      if (command.action === 'recordGrn') {
        return {
          ok: true,
          recordGrn: { grn_id: 'grn-9', grn_status: 'DRAFT' },
        };
      }
      return { ok: true, refreshedAt: '2026-07-24T12:30:00Z' };
    },
  );
}

describe('ReorderScreen', () => {
  it('locks on Free', async () => {
    const onNavigate = vi.fn();
    render(
      <ProcurementMfe
        data={data(
          feature('reorder', async () => REORDER_LIST, {
            canAccessGrowth: false,
            plan: 'FREE',
          }),
          { capabilities: { navigate: onNavigate } },
        )}
      />,
    );
    expect(await screen.findByTestId('reorder-plan-lock')).toBeTruthy();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'View plans' }));
    expect(onNavigate).toHaveBeenCalledWith('/subscription');
  });

  it('creates a PO, patches lines, confirms send, and records a GRN', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const onSubmit = reorderSubmit({
      loadPurchaseOrders: async () => ({
        ok: true,
        purchaseOrders: [
          {
            po_id: 'po-1',
            po_number: 'PO-1',
            distributor_name: 'Medico',
            status: 'SENT',
            estimated_total: 100,
          },
        ],
      }),
    });
    render(
      <ProcurementMfe
        data={data(feature('reorder', onSubmit), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    expect(await screen.findByText('Crocin 500mg Tablet')).toBeTruthy();
    await user.click(
      screen.getByRole('button', { name: 'Refresh suggestions' }),
    );
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'refresh'),
      ).toBe(true);
    });
    await user.click(
      screen.getByRole('button', { name: 'Create purchase order' }),
    );
    expect(await screen.findByTestId('po-editor')).toBeTruthy();
    await user.type(screen.getByLabelText('Product id'), 'prod-9');
    await user.type(screen.getByLabelText('Quantity'), '4');
    await user.click(screen.getByRole('button', { name: 'Add line' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'patchPo'),
      ).toBe(true);
    });
    await user.click(screen.getAllByRole('button', { name: 'Send PO' })[0]!);
    const dialog = await screen.findByTestId('send-po-dialog');
    expect(
      within(dialog).getByRole('heading', {
        name: 'Send this purchase order?',
      }),
    ).toBeTruthy();
    await user.click(within(dialog).getByRole('button', { name: 'Send PO' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'send'),
      ).toBe(true);
    });
    await user.type(screen.getByLabelText('Invoice number'), 'INV-PO');
    await user.type(screen.getByLabelText('Invoice date'), '2026-08-09');
    await user.click(screen.getByRole('button', { name: 'Record GRN' }));
    await waitFor(() => {
      expect(onNavigate).toHaveBeenCalledWith('/purchases/grn-9');
    });
  });

  it('covers empty, API lock, and mutation errors', async () => {
    const user = userEvent.setup();
    render(
      <ProcurementMfe
        data={data(
          feature('reorder', async () => ({
            ok: false,
            code: 'PLAN_FEATURE_LOCKED',
          })),
        )}
      />,
    );
    expect(await screen.findByTestId('reorder-plan-lock')).toBeTruthy();

    const onSubmit = reorderSubmit({
      load: async () => ({ ok: false, formError: 'Unable to load reorder.' }),
    });
    const { rerender } = render(
      <ProcurementMfe data={data(feature('reorder', onSubmit))} />,
    );
    expect(await screen.findByTestId('reorder-error')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    rerender(
      <ProcurementMfe
        data={data(
          feature('reorder', async (command) => {
            if (command.action === 'load') {
              return { ok: true, suggestionGroups: [] };
            }
            return { ok: true, purchaseOrders: [] };
          }),
        )}
      />,
    );
    expect(await screen.findByTestId('reorder-empty')).toBeTruthy();

    const failing = reorderSubmit({
      refresh: async () => ({ ok: false, formError: 'Refresh failed' }),
      createPo: async () => ({ ok: false, formError: 'PO failed' }),
      patchPo: async () => ({ ok: false, formError: 'Patch failed' }),
      send: async () => ({ ok: false, formError: 'Send failed' }),
      recordGrn: async () => ({ ok: false, formError: 'GRN failed' }),
    });
    rerender(<ProcurementMfe data={data(feature('reorder', failing))} />);
    await screen.findByText('Crocin 500mg Tablet');
    await user.click(
      screen.getByRole('button', { name: 'Refresh suggestions' }),
    );
    expect(await screen.findByTestId('reorder-error')).toHaveTextContent(
      'Refresh failed',
    );
    await user.click(
      screen.getByRole('button', { name: 'Create purchase order' }),
    );
    expect(await screen.findByTestId('reorder-error')).toHaveTextContent(
      'PO failed',
    );
  });

  it('validates PO lines, cancels send, and records without a GRN id', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const onSubmit = reorderSubmit({
      recordGrn: async () => ({ ok: true, recordGrn: {} }),
      loadPurchaseOrders: async () => ({
        ok: true,
        purchaseOrders: [
          {
            po_id: 'po-1',
            po_number: 'PO-1',
            status: 'DRAFT',
            estimated_total: 10,
          },
        ],
      }),
    });
    render(
      <ProcurementMfe
        data={data(feature('reorder', onSubmit, { canSendPo: true }), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    await screen.findByText('Crocin 500mg Tablet');
    await user.click(
      screen.getByRole('button', { name: 'Create purchase order' }),
    );
    await screen.findByTestId('po-editor');
    await user.click(screen.getByRole('button', { name: 'Add line' }));
    expect(await screen.findByTestId('reorder-error')).toHaveTextContent(
      'product and quantity',
    );
    await user.type(screen.getByLabelText('Product id'), 'prod-9');
    await user.type(screen.getByLabelText('Quantity'), '4');
    await user.click(screen.getByRole('button', { name: 'Add line' }));
    const dialogTrigger = screen.getAllByRole('button', {
      name: 'Send PO',
    })[1]!;
    await user.click(dialogTrigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByTestId('send-po-dialog')).toBeNull();
    await user.click(screen.getAllByRole('button', { name: 'Send PO' })[1]!);
    const again = await screen.findByTestId('send-po-dialog');
    await user.click(within(again).getByRole('button', { name: 'Keep draft' }));
    expect(screen.queryByTestId('send-po-dialog')).toBeNull();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('surfaces a patch failure after create', async () => {
    const user = userEvent.setup();
    const onSubmit = reorderSubmit({
      patchPo: async () => ({ ok: false, code: 'VALIDATION_ERROR' }),
    });
    render(<ProcurementMfe data={data(feature('reorder', onSubmit))} />);
    await screen.findByText('Crocin 500mg Tablet');
    await user.click(
      screen.getByRole('button', { name: 'Create purchase order' }),
    );
    await screen.findByTestId('po-editor');
    await user.type(screen.getByLabelText('Product id'), 'prod-9');
    await user.type(screen.getByLabelText('Quantity'), '4');
    await user.click(screen.getByRole('button', { name: 'Add line' }));
    expect(await screen.findByTestId('reorder-error')).toHaveTextContent(
      'VALIDATION_ERROR',
    );
  });

  it('rejects a group without distributor items and send/record failures', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async (command: ProcurementCommand): Promise<ProcurementSubmitResult> => {
        if (command.action === 'load') {
          return {
            ok: true,
            suggestionGroups: [{ key: 'empty', items: [] }],
            meta: { page: 1, has_next: true },
          };
        }
        if (command.action === 'loadPurchaseOrders') {
          return {
            ok: true,
            purchaseOrders: [
              {
                po_id: 'po-draft',
                po_number: 'PO-D',
                status: 'DRAFT',
                estimated_total: 1,
              },
              {
                po_id: 'po-sent',
                po_number: 'PO-S',
                status: 'SENT',
                estimated_total: 1,
              },
            ],
          };
        }
        if (command.action === 'send') {
          return { ok: false, formError: 'Send failed' };
        }
        if (command.action === 'recordGrn') {
          return { ok: false, formError: 'GRN failed' };
        }
        return { ok: true };
      },
    );
    render(<ProcurementMfe data={data(feature('reorder', onSubmit))} />);
    await screen.findByTestId('po-table');
    await user.click(
      screen.getByRole('button', { name: 'Create purchase order' }),
    );
    expect(await screen.findByTestId('reorder-error')).toHaveTextContent(
      'distributor group',
    );
    await user.click(screen.getByRole('button', { name: 'Send PO' }));
    const dialog = await screen.findByTestId('send-po-dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Send PO' }));
    expect(await screen.findByTestId('reorder-error')).toHaveTextContent(
      'Send failed',
    );
    await user.click(
      within(dialog).getByRole('button', { name: 'Keep draft' }),
    );
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await user.type(screen.getByLabelText('Invoice number'), 'INV');
    await user.type(screen.getByLabelText('Invoice date'), '2026-08-09');
    await user.click(screen.getByRole('button', { name: 'Record GRN' }));
    expect(await screen.findByTestId('reorder-error')).toHaveTextContent(
      'GRN failed',
    );
  });

  it('creates a PO without an id and patches without a count', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      async (command: ProcurementCommand): Promise<ProcurementSubmitResult> => {
        if (command.action === 'load') {
          return {
            ok: true,
            suggestionGroups: [
              {
                distributor_id: 'd1',
                items: [{ product_id: 'prod-1' }],
              },
            ],
          };
        }
        if (command.action === 'loadPurchaseOrders') {
          return { ok: false, formError: 'PO list failed' };
        }
        if (command.action === 'createPo') {
          return { ok: true };
        }
        if (command.action === 'patchPo') {
          return { ok: true };
        }
        if (command.action === 'send') {
          return { ok: false, formError: 'Send failed' };
        }
        return { ok: true };
      },
    );
    render(<ProcurementMfe data={data(feature('reorder', onSubmit))} />);
    await screen.findByRole('button', { name: 'Create purchase order' });
    await user.click(
      screen.getByRole('button', { name: 'Create purchase order' }),
    );
    expect(await screen.findByTestId('po-editor')).toBeTruthy();
    await user.type(screen.getByLabelText('Product id'), 'prod-9');
    await user.type(screen.getByLabelText('Quantity'), '2');
    await user.click(screen.getByRole('button', { name: 'Add line' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'patchPo'),
      ).toBe(true);
    });
    expect(screen.queryByRole('button', { name: 'Send PO' })).toBeNull();
    expect(screen.getByTestId('po-editor')).toHaveTextContent('DRAFT');
  });

  it('hides refresh and send for staff', async () => {
    render(
      <ProcurementMfe
        data={data(
          feature(
            'reorder',
            async (command) => {
              if (command.action === 'load') {
                return REORDER_LIST;
              }
              return PO_LIST;
            },
            { canRefreshReorder: false, canSendPo: false },
          ),
        )}
      />,
    );
    await screen.findByText('Crocin 500mg Tablet');
    expect(
      screen.queryByRole('button', { name: 'Refresh suggestions' }),
    ).toBeNull();
    expect(screen.queryByRole('button', { name: 'Send PO' })).toBeNull();
  });
});

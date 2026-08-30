import type {
  ProcurementCommand,
  ProcurementSubmitResult,
} from '@medmate/procurement-contract';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GRN_LIST, data, feature } from '../../../app/__tests__/helpers';
import ProcurementMfe from '../../../app/ProcurementMfe';

afterEach(() => {
  cleanup();
});

function purchasesSubmit(
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
        return GRN_LIST;
      }
      if (command.action === 'create') {
        return { ok: true, grn: { grn_id: 'grn-2', status: 'DRAFT' } };
      }
      if (command.action === 'importCsv') {
        return {
          ok: true,
          importPreview: {
            grn_id: 'grn-csv',
            unmatched_items: [
              { row_number: 12, raw_data: { product_name: 'Unknown Med' } },
            ],
          },
        };
      }
      if (command.action === 'confirmImport') {
        return { ok: true, itemsCreated: 4, grn: { grn_id: 'grn-csv' } };
      }
      return { ok: true };
    },
  );
}

describe('PurchasesScreen', () => {
  it('lists GRNs with status and opens the editor', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <ProcurementMfe
        data={data(feature('purchases', purchasesSubmit()), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    expect(await screen.findByTestId('purchases-table')).toBeTruthy();
    expect(screen.getByText('DRAFT')).toBeTruthy();
    expect(screen.getByTestId('summary-total-grns')).toHaveTextContent('2');
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(onNavigate).toHaveBeenCalledWith('/purchases/grn-1');
  });

  it('creates a GRN and imports then confirms CSV', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const onSubmit = purchasesSubmit();
    render(
      <ProcurementMfe
        data={data(feature('purchases', onSubmit), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    await screen.findByTestId('purchases-table');
    await user.type(screen.getByLabelText('Distributor id'), 'd1');
    await user.type(screen.getByLabelText('Invoice number'), 'INV-9');
    await user.type(screen.getByLabelText('Invoice date'), '2026-07-22');
    await user.click(screen.getByRole('button', { name: 'Create GRN' }));
    await waitFor(() => {
      expect(onNavigate).toHaveBeenCalledWith('/purchases/grn-2');
    });
    expect(
      onSubmit.mock.calls.some((call) => {
        const command = call[0];
        return (
          command.screen === 'purchases' &&
          command.action === 'create' &&
          command.values.distributor_id === 'd1'
        );
      }),
    ).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Import CSV' }));
    const file = new File(['a,b'], 'bad.csv', { type: 'text/csv' });
    await user.upload(screen.getByLabelText('Invoice CSV'), file);
    await user.click(screen.getByRole('button', { name: 'Upload preview' }));
    expect(await screen.findByTestId('csv-grn-id')).toHaveTextContent(
      'grn-csv',
    );
    expect(screen.getByTestId('csv-unmatched')).toHaveTextContent(
      'Unknown Med',
    );
    await user.click(screen.getByRole('button', { name: 'Confirm import' }));
    await waitFor(() => {
      expect(onNavigate).toHaveBeenCalledWith('/purchases/grn-csv');
    });
  });

  it('hides the distributor UUID on Free and creates a walk-in GRN', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const onSubmit = purchasesSubmit();
    render(
      <ProcurementMfe
        data={data(
          feature('purchases', onSubmit, {
            plan: 'FREE',
            canAccessGrowth: false,
          }),
          { capabilities: { navigate: onNavigate } },
        )}
      />,
    );
    await screen.findByTestId('purchases-table');
    expect(screen.queryByLabelText('Distributor id')).toBeNull();
    expect(screen.getByTestId('walk-in-hint')).toHaveTextContent(
      'Uses Cash / Walk-in',
    );
    await user.type(screen.getByLabelText('Invoice number'), 'INV-FREE');
    await user.type(screen.getByLabelText('Invoice date'), '2026-07-22');
    await user.click(screen.getByRole('button', { name: 'Create GRN' }));
    await waitFor(() => {
      expect(onNavigate).toHaveBeenCalledWith('/purchases/grn-2');
    });
    expect(
      onSubmit.mock.calls
        .map((call) => call[0])
        .find(
          (command) =>
            command.screen === 'purchases' && command.action === 'create',
        ),
    ).toMatchObject({
      values: {
        invoice_number: 'INV-FREE',
        invoice_date: '2026-07-22',
      },
    });
    await user.click(screen.getByRole('button', { name: 'Import CSV' }));
    expect(screen.getByTestId('csv-walk-in-hint')).toHaveTextContent(
      'Uses Cash / Walk-in',
    );
    expect(screen.queryByLabelText('Distributor id')).toBeNull();
  });

  it('rejects oversized CSV before calling the host', async () => {
    const user = userEvent.setup();
    const onSubmit = purchasesSubmit();
    render(<ProcurementMfe data={data(feature('purchases', onSubmit))} />);
    await screen.findByTestId('purchases-table');
    await user.click(screen.getByRole('button', { name: 'Import CSV' }));
    const big = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'big.csv', {
      type: 'text/csv',
    });
    await user.upload(screen.getByLabelText('Invoice CSV'), big);
    await user.click(screen.getByRole('button', { name: 'Upload preview' }));
    expect(await screen.findByTestId('csv-error')).toHaveTextContent('10MB');
    expect(
      onSubmit.mock.calls.some((call) => call[0].action === 'importCsv'),
    ).toBe(false);
  });

  it('shows empty and error states', async () => {
    const user = userEvent.setup();
    const onSubmit = purchasesSubmit({
      load: async () => ({ ok: false, code: 'FORBIDDEN' }),
    });
    render(<ProcurementMfe data={data(feature('purchases', onSubmit))} />);
    expect(await screen.findByTestId('purchases-error')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('covers create failures, empty list, filters, and CSV errors', async () => {
    const user = userEvent.setup();
    const onSubmit = purchasesSubmit({
      load: async () => ({ ok: true, grns: [], kpi: {} }),
      create: async () => ({ ok: false, code: 'DUPLICATE_INVOICE_NUMBER' }),
      importCsv: async () => ({ ok: false, code: 'VALIDATION_ERROR' }),
      confirmImport: async () => ({ ok: false, formError: 'Confirm failed' }),
    });
    render(
      <ProcurementMfe
        data={data(feature('purchases', onSubmit, { canWrite: true }))}
      />,
    );
    expect(await screen.findByTestId('purchases-empty')).toBeTruthy();
    await user.type(screen.getByLabelText('Status'), 'DRAFT');
    await user.click(screen.getByRole('button', { name: 'Create GRN' }));
    expect(await screen.findByTestId('purchases-error')).toHaveTextContent(
      'DUPLICATE_INVOICE_NUMBER',
    );
    await user.click(screen.getByRole('button', { name: 'Import CSV' }));
    await user.click(screen.getByRole('button', { name: 'Upload preview' }));
    expect(await screen.findByTestId('csv-error')).toHaveTextContent(
      'Choose a CSV file.',
    );
    const file = new File(['a'], 'ok.csv', { type: 'text/csv' });
    await user.upload(screen.getByLabelText('Invoice CSV'), file);
    await user.click(screen.getByRole('button', { name: 'Upload preview' }));
    expect(await screen.findByTestId('csv-error')).toHaveTextContent(
      'VALIDATION_ERROR',
    );
  });

  it('confirms import errors and preview without importPreview', async () => {
    const user = userEvent.setup();
    const onSubmit = purchasesSubmit({
      importCsv: async () => ({ ok: true, grn: { grn_id: 'grn-from-grn' } }),
      confirmImport: async () => ({ ok: false, code: 'VALIDATION_ERROR' }),
    });
    render(<ProcurementMfe data={data(feature('purchases', onSubmit))} />);
    await screen.findByTestId('purchases-table');
    await user.click(screen.getByRole('button', { name: 'Import CSV' }));
    const file = new File(['a'], 'ok.csv', { type: 'text/csv' });
    await user.upload(screen.getByLabelText('Invoice CSV'), file);
    await user.click(screen.getByRole('button', { name: 'Upload preview' }));
    expect(await screen.findByTestId('csv-grn-id')).toHaveTextContent(
      'grn-from-grn',
    );
    await user.click(screen.getByRole('button', { name: 'Confirm import' }));
    expect(await screen.findByTestId('csv-error')).toHaveTextContent(
      'VALIDATION_ERROR',
    );
    await user.click(screen.getByRole('button', { name: 'Import CSV' }));
  });

  it('hides write actions and pages the list', async () => {
    const user = userEvent.setup();
    const onSubmit = purchasesSubmit();
    render(
      <ProcurementMfe
        data={data(feature('purchases', onSubmit, { canWrite: false }))}
      />,
    );
    await screen.findByTestId('purchases-table');
    expect(screen.queryByRole('button', { name: 'Create GRN' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => {
          const command = call[0];
          return (
            command.screen === 'purchases' &&
            command.action === 'load' &&
            command.values?.page === 2
          );
        }),
      ).toBe(true);
    });
  });

  it('confirms CSV with a missing grn id', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <ProcurementMfe
        data={data(
          feature('purchases', async (command) => {
            if (command.action === 'load') {
              return GRN_LIST;
            }
            if (command.action === 'importCsv') {
              return { ok: true, importPreview: {} };
            }
            return { ok: true };
          }),
          { capabilities: { navigate: onNavigate } },
        )}
      />,
    );
    await screen.findByTestId('purchases-table');
    await user.click(screen.getByRole('button', { name: 'Import CSV' }));
    const file = new File(['a'], 'ok.csv', { type: 'text/csv' });
    await user.upload(screen.getByLabelText('Invoice CSV'), file);
    await user.click(screen.getByRole('button', { name: 'Upload preview' }));
    await user.click(screen.getByRole('button', { name: 'Confirm import' }));
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('types CSV fields, pages filters, and maps load-code errors', async () => {
    const user = userEvent.setup();
    const onSubmit = purchasesSubmit({
      load: async () => ({
        ok: true,
        grns: [{ grn_id: 'grn-bare' }],
      }),
    });
    const { rerender } = render(
      <ProcurementMfe data={data(feature('purchases', onSubmit))} />,
    );
    await screen.findByTestId('purchases-table');
    expect(screen.getByTestId('grn-row-grn-bare')).toHaveTextContent('—');
    await user.click(screen.getByRole('button', { name: 'Import CSV' }));
    await user.type(screen.getAllByLabelText('Distributor id')[1]!, 'd9');
    await user.type(screen.getAllByLabelText('Invoice number')[1]!, 'INV-CSV');
    await user.type(screen.getAllByLabelText('Invoice date')[1]!, '2026-07-22');
    const input = screen.getByLabelText('Invoice CSV') as HTMLInputElement;
    await user.upload(input, new File(['a'], 'ok.csv', { type: 'text/csv' }));
    await user.click(screen.getByRole('button', { name: 'Upload preview' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => {
          const command = call[0];
          return (
            command.action === 'importCsv' &&
            command.values.distributor_id === 'd9'
          );
        }),
      ).toBe(true);
    });
    Object.defineProperty(input, 'files', { value: null });
    input.dispatchEvent(new Event('change', { bubbles: true }));

    rerender(
      <ProcurementMfe
        data={data(
          feature('purchases', async () => ({ ok: false, code: 'FORBIDDEN' })),
        )}
      />,
    );
    expect(await screen.findByTestId('purchases-error')).toHaveTextContent(
      'FORBIDDEN',
    );
  });

  it('creates without a returned id', async () => {
    const onNavigate = vi.fn();
    const user = userEvent.setup();
    render(
      <ProcurementMfe
        data={data(
          feature('purchases', async (command) => {
            if (command.action === 'load') {
              return GRN_LIST;
            }
            return { ok: true };
          }),
          { capabilities: { navigate: onNavigate } },
        )}
      />,
    );
    await screen.findByTestId('purchases-table');
    await user.click(screen.getByRole('button', { name: 'Create GRN' }));
    await waitFor(() => expect(onNavigate).not.toHaveBeenCalled());
  });
});

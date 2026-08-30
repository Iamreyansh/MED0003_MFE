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
  COMPARE,
  DISTRIBUTOR_LIST,
  SUPPLY,
  data,
  feature,
} from '../../../app/__tests__/helpers';
import ProcurementMfe from '../../../app/ProcurementMfe';

afterEach(() => {
  cleanup();
});

function distSubmit(
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
        return DISTRIBUTOR_LIST;
      }
      if (command.action === 'loadSupply') {
        return SUPPLY;
      }
      if (command.action === 'loadPriceCompare') {
        return COMPARE;
      }
      if (command.action === 'create') {
        return {
          ok: true,
          distributor: { id: 'd2', firm_name: 'New Firm' },
        };
      }
      return { ok: true, deleted: true };
    },
  );
}

describe('DistributorsScreen', () => {
  it('locks on Free and still locks when Core returns PLAN_FEATURE_LOCKED', async () => {
    const onNavigate = vi.fn();
    render(
      <ProcurementMfe
        data={data(
          feature('distributors', async () => DISTRIBUTOR_LIST, {
            canAccessGrowth: false,
            plan: 'FREE',
          }),
          { capabilities: { navigate: onNavigate } },
        )}
      />,
    );
    expect(await screen.findByTestId('distributors-plan-lock')).toBeTruthy();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'View plans' }));
    expect(onNavigate).toHaveBeenCalledWith('/subscription');

    render(
      <ProcurementMfe
        data={data(
          feature('distributors', async () => ({
            ok: false,
            code: 'PLAN_FEATURE_LOCKED',
          })),
        )}
      />,
    );
    expect(await screen.findByTestId('distributors-plan-lock')).toBeTruthy();
    const buttons = screen.getAllByRole('button', { name: 'View plans' });
    await userEvent.setup().click(buttons[buttons.length - 1]!);
  });

  it('creates, compares, prefers, and deletes a distributor', async () => {
    const user = userEvent.setup();
    const onSubmit = distSubmit();
    render(<ProcurementMfe data={data(feature('distributors', onSubmit))} />);
    expect(await screen.findByTestId('distributors-table')).toBeTruthy();
    await user.type(screen.getByLabelText('Firm name'), 'New Firm');
    await user.type(screen.getByLabelText('Phone'), '+919876543210');
    await user.type(screen.getByLabelText('GSTIN'), '27AABCM1234A1Z5');
    await user.click(screen.getByRole('button', { name: 'Add distributor' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'create'),
      ).toBe(true);
    });
    await user.click(screen.getByRole('button', { name: 'Price compare' }));
    expect(await screen.findByTestId('price-compare-table')).toBeTruthy();
    expect(
      screen.getByRole('columnheader', { name: 'Distributor' }),
    ).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Supply list' }));
    expect(await screen.findByTestId('supply-table')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Set preferred' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'setPreferred'),
      ).toBe(true);
    });
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Delete this distributor?')).toBeTruthy();
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'delete'),
      ).toBe(true);
    });
  });

  it('covers empty, retry, cancel delete, and mutation errors', async () => {
    const user = userEvent.setup();
    const onSubmit = distSubmit({
      load: async () => ({ ok: false, formError: 'Unable to load firms.' }),
    });
    const { rerender } = render(
      <ProcurementMfe data={data(feature('distributors', onSubmit))} />,
    );
    expect(await screen.findByTestId('distributors-error')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    rerender(
      <ProcurementMfe
        data={data(
          feature('distributors', async () => ({ ok: true, distributors: [] })),
        )}
      />,
    );
    expect(await screen.findByTestId('distributors-empty')).toBeTruthy();

    const failing = distSubmit({
      create: async () => ({ ok: false, formError: 'Create failed' }),
      delete: async () => ({ ok: false, formError: 'Delete failed' }),
      loadSupply: async () => ({ ok: false, code: 'DISTRIBUTOR_NOT_FOUND' }),
      loadPriceCompare: async () => ({
        ok: false,
        formError: 'Compare failed',
      }),
      setPreferred: async () => ({ ok: false, formError: 'Prefer failed' }),
    });
    rerender(<ProcurementMfe data={data(feature('distributors', failing))} />);
    await screen.findByTestId('distributors-table');
    await user.click(screen.getByRole('button', { name: 'Add distributor' }));
    expect(await screen.findByTestId('distributors-error')).toHaveTextContent(
      'Create failed',
    );
    await user.click(screen.getByRole('button', { name: 'Price compare' }));
    expect(await screen.findByTestId('distributors-error')).toHaveTextContent(
      'Compare failed',
    );
    await user.click(screen.getByRole('button', { name: 'Supply list' }));
    expect(await screen.findByTestId('distributors-error')).toHaveTextContent(
      'DISTRIBUTOR_NOT_FOUND',
    );
    const okSupply = distSubmit({
      loadSupply: async () => SUPPLY,
      setPreferred: async () => ({ ok: false, formError: 'Prefer failed' }),
      delete: async () => ({ ok: false, formError: 'Delete failed' }),
    });
    rerender(<ProcurementMfe data={data(feature('distributors', okSupply))} />);
    await screen.findByTestId('distributors-table');
    await user.click(screen.getByRole('button', { name: 'Supply list' }));
    await screen.findByTestId('supply-table');
    await user.click(screen.getByRole('button', { name: 'Set preferred' }));
    expect(await screen.findByTestId('distributors-error')).toHaveTextContent(
      'Prefer failed',
    );
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const keep = await screen.findByRole('dialog');
    await user.click(
      within(keep).getByRole('button', { name: 'Keep distributor' }),
    );
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const again = await screen.findByRole('dialog');
    await user.click(within(again).getByRole('button', { name: 'Delete' }));
    expect(await screen.findByTestId('distributors-error')).toHaveTextContent(
      'Delete failed',
    );
  });

  it('renders compare rows without prices and pages the directory', async () => {
    const user = userEvent.setup();
    const onSubmit = distSubmit({
      load: async () => ({
        ok: true,
        distributors: [{ id: 'd1', firm_name: 'Medico Pharma' }],
        meta: { page: 1, has_next: true },
      }),
      loadPriceCompare: async () => ({
        ok: true,
        compare: [
          {
            product_id: 'prod-1',
            product_name: 'Crocin',
            distributor_prices: [
              { distributor_id: 'd1', distributor_name: 'Medico' },
            ],
          },
        ],
      }),
    });
    render(<ProcurementMfe data={data(feature('distributors', onSubmit))} />);
    await screen.findByTestId('distributors-table');
    await user.click(screen.getByRole('button', { name: 'Price compare' }));
    expect(await screen.findByTestId('price-compare-table')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => {
          const command = call[0];
          return (
            command.action === 'load' &&
            command.screen === 'distributors' &&
            command.values?.page === 2
          );
        }),
      ).toBe(true);
    });
  });

  it('hides owner mutations and shows preferred badge', async () => {
    render(
      <ProcurementMfe
        data={data(
          feature(
            'distributors',
            async (command) => {
              if (command.action === 'loadSupply') {
                return {
                  ok: true,
                  supplyItems: [
                    {
                      product_id: 'prod-1',
                      product_name: 'Crocin',
                      is_preferred_source: true,
                    },
                  ],
                };
              }
              return DISTRIBUTOR_LIST;
            },
            {
              canMutateDistributors: false,
              canPriceCompare: false,
            },
          ),
        )}
      />,
    );
    await screen.findByTestId('distributors-table');
    expect(
      screen.queryByRole('button', { name: 'Add distributor' }),
    ).toBeNull();
    expect(screen.queryByRole('button', { name: 'Price compare' })).toBeNull();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Supply list' }));
    expect(await screen.findByTestId('supply-table')).toBeTruthy();
    expect(screen.getAllByText('Preferred').length).toBeGreaterThan(1);
  });

  it('hides preferred actions for staff supply that is not marked', async () => {
    render(
      <ProcurementMfe
        data={data(
          feature(
            'distributors',
            async (command) => {
              if (command.action === 'loadSupply') {
                return SUPPLY;
              }
              return DISTRIBUTOR_LIST;
            },
            { canMutateDistributors: false, canPriceCompare: false },
          ),
        )}
      />,
    );
    await screen.findByTestId('distributors-table');
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Supply list' }));
    expect(await screen.findByTestId('supply-table')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Set preferred' })).toBeNull();
  });
});

import type {
  OrdersCommand,
  OrdersSubmitResult,
} from '@medmate/orders-contract';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QUOTE_LIST, data, feature } from '../../../app/__tests__/helpers';
import OrdersMfe from '../../../app/OrdersMfe';

afterEach(() => {
  cleanup();
});

function quotesSubmit(
  overrides: Partial<
    Record<OrdersCommand['action'], () => Promise<OrdersSubmitResult>>
  > = {},
) {
  return vi.fn(async (command: OrdersCommand): Promise<OrdersSubmitResult> => {
    const override = overrides[command.action];
    if (override) {
      return override();
    }
    if (command.action === 'load') {
      return QUOTE_LIST;
    }
    return { ok: true };
  });
}

describe('RxQuotesScreen', () => {
  it('lists quotes and hides expired actions', async () => {
    render(<OrdersMfe data={data(feature('rx-quotes', quotesSubmit()))} />);
    expect(await screen.findByTestId('orders-quotes-table')).toBeTruthy();
    expect(screen.getByTestId('orders-quote-readonly-q-expired')).toBeTruthy();
    expect(screen.queryByTestId('orders-quote-readonly-q-1')).toBeNull();
  });

  it('quotes, declines, and pages after success', async () => {
    const user = userEvent.setup();
    const onSubmit = quotesSubmit();
    render(<OrdersMfe data={data(feature('rx-quotes', onSubmit))} />);
    await user.click(await screen.findByRole('button', { name: 'Quote' }));
    await user.type(screen.getByLabelText('Quoted price'), '120');
    await user.type(screen.getByLabelText('Notes'), 'Same day');
    await user.click(screen.getByRole('button', { name: 'Send quote' }));
    expect(onSubmit).toHaveBeenCalledWith({
      screen: 'rx-quotes',
      action: 'quote',
      values: { quoteId: 'q-1', price: 120, notes: 'Same day' },
    });
    await user.click(screen.getByRole('button', { name: 'Decline' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Decline' }));
    await user.type(screen.getByLabelText('Decline reason'), 'No stock');
    await user.click(screen.getByRole('button', { name: 'Confirm decline' }));
    expect(onSubmit).toHaveBeenCalledWith({
      screen: 'rx-quotes',
      action: 'decline',
      values: { quoteId: 'q-1', reason: 'No stock' },
    });
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(
      onSubmit.mock.calls.some(
        (call) => call[0].action === 'load' && call[0].values?.page === 2,
      ),
    ).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Previous page' }));
  });

  it('shows empty, error retry, and price validation', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (command: OrdersCommand) => {
      if (command.action === 'load') {
        return { ok: true, quotes: [], meta: { page: 1 } };
      }
      return {
        ok: false,
        code: 'PRICE_ABOVE_MRP',
        fieldErrors: { price: 'High' },
      };
    });
    const { rerender } = render(
      <OrdersMfe data={data(feature('rx-quotes', onSubmit))} />,
    );
    expect(await screen.findByTestId('orders-quotes-empty')).toBeTruthy();
    rerender(
      <OrdersMfe
        data={data(
          feature('rx-quotes', async () => ({
            ok: false,
            code: 'UNAUTHORIZED',
          })),
        )}
      />,
    );
    expect(await screen.findByTestId('orders-quotes-error')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    rerender(<OrdersMfe data={data(feature('rx-quotes', quotesSubmit()))} />);
    await user.click(await screen.findByRole('button', { name: 'Quote' }));
    await user.click(screen.getByRole('button', { name: 'Send quote' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a price.');
    await user.type(screen.getByLabelText('Quoted price'), '99');
    await user.click(screen.getByRole('button', { name: 'Send quote' }));
  });

  it('maps quote and decline failures and closes dialogs', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (command: OrdersCommand) => {
      if (command.action === 'load') {
        return QUOTE_LIST;
      }
      if (command.action === 'quote' && command.values.price >= 500) {
        return {
          ok: false as const,
          code: 'PRICE_ABOVE_MRP',
          fieldErrors: { price: 'Above MRP' },
        };
      }
      if (command.action === 'quote') {
        return { ok: false as const, code: 'VALIDATION_ERROR' };
      }
      return { ok: false as const, fieldErrors: { reason: 'Need reason' } };
    });
    render(<OrdersMfe data={data(feature('rx-quotes', onSubmit))} />);
    await user.click(await screen.findByRole('button', { name: 'Quote' }));
    await user.type(screen.getByLabelText('Quoted price'), '500');
    await user.click(screen.getByRole('button', { name: 'Send quote' }));
    expect(await screen.findByTestId('orders-quotes-error')).toHaveTextContent(
      'PRICE_ABOVE_MRP',
    );
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Quote' }));
    await user.type(screen.getByLabelText('Quoted price'), '10');
    await user.click(screen.getByRole('button', { name: 'Send quote' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Decline' }));
    await user.click(screen.getByRole('button', { name: 'Confirm decline' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Need reason');
    await user.keyboard('{Escape}');
  });

  it('changes status filter', async () => {
    const user = userEvent.setup();
    const onSubmit = quotesSubmit();
    render(<OrdersMfe data={data(feature('rx-quotes', onSubmit))} />);
    await screen.findByTestId('orders-quotes-table');
    await user.selectOptions(screen.getByLabelText('Status'), 'EXPIRED');
    expect(
      onSubmit.mock.calls.some(
        (call) =>
          call[0].action === 'load' && call[0].values?.status === 'EXPIRED',
      ),
    ).toBe(true);
    await user.selectOptions(screen.getByLabelText('Status'), '');
  });
});

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature } from '../../../app/__tests__/helpers';
import OrdersMfe from '../../../app/OrdersMfe';

afterEach(() => {
  cleanup();
});

describe('OrdersHomeScreen', () => {
  it('loads inbound orders and opens one', async () => {
    const onSubmit = vi.fn(async () => ({
      ok: true as const,
      orders: [
        {
          order_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          order_number: 'ORD-1',
          status: 'PENDING_ACCEPTANCE',
          items_count: 2,
          total: '115.00',
          created_at: '2026-08-30',
        },
        {
          order_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
          status: 'ACCEPTED',
          items_count: 1,
          total: '10.00',
          created_at: '2026-08-31',
        },
      ],
      meta: { page: 1, has_next: true },
    }));
    const navigate = vi.fn();
    render(
      <OrdersMfe
        data={data(feature('orders-home', onSubmit), {
          capabilities: { navigate },
        })}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('orders-home-table')).toBeTruthy();
    });
    expect(
      screen.getByText('b2c3d4e5-f6a7-8901-bcde-f12345678901'),
    ).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'Open' })[0]!);
    expect(navigate).toHaveBeenCalledWith(
      '/orders/3fa85f64-5717-4562-b3fc-2c963f66afa6',
    );
    await userEvent.selectOptions(
      screen.getByLabelText('Status'),
      'PENDING_ACCEPTANCE',
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Next page' })).toBeTruthy();
    });
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onSubmit.mock.calls.length).toBeGreaterThan(1);
  });

  it('shows empty and error states', async () => {
    const empty = vi.fn(async () => ({ ok: true as const, orders: [] }));
    const { rerender } = render(
      <OrdersMfe data={data(feature('orders-home', empty))} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('orders-home-empty')).toBeTruthy();
    });
    const failing = vi.fn(async () => ({
      ok: false as const,
      formError: 'Unable to load orders.',
    }));
    rerender(<OrdersMfe data={data(feature('orders-home', failing))} />);
    await waitFor(() => {
      expect(screen.getByTestId('orders-home-error')).toHaveTextContent(
        'Unable to load orders.',
      );
    });
  });
});

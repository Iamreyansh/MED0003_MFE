import type {
  OrdersCommand,
  OrdersSubmitResult,
} from '@medmate/orders-contract';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ORDER_ID,
  RIDER_ID,
  data,
  feature,
} from '../../../app/__tests__/helpers';
import OrdersMfe from '../../../app/OrdersMfe';

afterEach(() => {
  cleanup();
});

function actionsSubmit(
  overrides: Partial<
    Record<OrdersCommand['action'], () => Promise<OrdersSubmitResult>>
  > = {},
) {
  return vi.fn(async (command: OrdersCommand): Promise<OrdersSubmitResult> => {
    const override = overrides[command.action];
    if (override) {
      return override();
    }
    return { ok: true };
  });
}

describe('OrderActionsScreen', () => {
  it('blocks invalid order ids without submitting', async () => {
    const user = userEvent.setup();
    const onSubmit = actionsSubmit();
    render(
      <OrdersMfe
        data={data(feature('order-actions', onSubmit, { orderId: 'nope' }))}
      />,
    );
    expect(screen.getByTestId('orders-actions-error')).toHaveTextContent(
      /UUID/i,
    );
    await user.click(screen.getByRole('button', { name: 'Accept' }));
    expect(
      onSubmit.mock.calls.some((call) => call[0].action === 'accept'),
    ).toBe(false);
    cleanup();
    render(
      <OrdersMfe
        data={data(feature('order-actions', onSubmit, { orderId: null }))}
      />,
    );
    expect(screen.getByTestId('orders-order-id')).toHaveTextContent('—');
  });

  it('accepts, rejects, advances status, and assigns a rider', async () => {
    const user = userEvent.setup();
    const onSubmit = actionsSubmit();
    render(
      <OrdersMfe
        data={data(
          feature('order-actions', onSubmit, { formError: 'Seeded error' }),
        )}
      />,
    );
    expect(screen.getByTestId('orders-actions-error')).toHaveTextContent(
      'Seeded error',
    );
    expect(screen.getByTestId('orders-order-id')).toHaveTextContent(ORDER_ID);
    await user.click(screen.getByRole('button', { name: 'Accept' }));
    expect(await screen.findByTestId('orders-actions-success')).toBeTruthy();
    expect(screen.getByTestId('orders-cached-status')).toHaveTextContent(
      /not live/i,
    );
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    expect(screen.getByLabelText('Rejection reason')).toBeTruthy();
    await user.type(screen.getByLabelText('Rejection reason'), 'No stock');
    await user.click(screen.getByRole('button', { name: 'Confirm reject' }));
    expect(await screen.findByTestId('orders-reject-refund')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'PACKED' }));
    await user.type(screen.getByLabelText('Rider id'), RIDER_ID);
    await user.click(screen.getByRole('button', { name: 'Assign rider' }));
    expect(onSubmit).toHaveBeenCalledWith({
      screen: 'order-actions',
      action: 'assignRider',
      values: { orderId: ORDER_ID, rider_id: RIDER_ID },
    });
    expect(onSubmit.mock.calls.some((call) => call[0].action === 'load')).toBe(
      false,
    );
  });

  it('maps 404, 409, already-actioned, and POS errors', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (command: OrdersCommand) => {
      if (command.action === 'accept') {
        return { ok: false, code: 'ORDER_NOT_FOUND' };
      }
      if (command.action === 'advanceStatus') {
        return command.values.status === 'CONFIRMED'
          ? { ok: false, code: 'ORDER_ALREADY_ACTIONED' }
          : { ok: false, code: 'INVALID_STATUS_TRANSITION' };
      }
      if (command.action === 'reject') {
        return { ok: false, formError: 'This order was already actioned.' };
      }
      if (command.action === 'assignRider') {
        return { ok: false, code: 'POS_TOKEN_RESTRICTED' };
      }
      return { ok: false, formError: 'Core said no.' };
    });
    render(<OrdersMfe data={data(feature('order-actions', onSubmit))} />);
    await user.click(screen.getByRole('button', { name: 'Accept' }));
    expect(await screen.findByTestId('orders-actions-error')).toHaveTextContent(
      /not found/i,
    );
    await user.click(screen.getByRole('button', { name: 'PACKED' }));
    expect(screen.getByTestId('orders-actions-error')).toHaveTextContent(
      /transition/i,
    );
    await user.click(screen.getByRole('button', { name: 'CONFIRMED' }));
    expect(screen.getByTestId('orders-actions-error')).toHaveTextContent(
      /already/i,
    );
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    await user.click(screen.getByRole('button', { name: 'Confirm reject' }));
    expect(screen.getByTestId('orders-actions-error')).toHaveTextContent(
      /already/i,
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.type(screen.getByLabelText('Rider id'), RIDER_ID);
    await user.click(screen.getByRole('button', { name: 'Assign rider' }));
    expect(screen.getByTestId('orders-actions-error')).toHaveTextContent(
      /session/i,
    );
  });

  it('does not assign an invalid rider id', async () => {
    const user = userEvent.setup();
    const onSubmit = actionsSubmit();
    render(<OrdersMfe data={data(feature('order-actions', onSubmit))} />);
    await user.type(screen.getByLabelText('Rider id'), 'not-a-uuid');
    await user.click(screen.getByRole('button', { name: 'Assign rider' }));
    expect(
      onSubmit.mock.calls.some((call) => call[0].action === 'assignRider'),
    ).toBe(false);
    expect(screen.getByRole('alert')).toHaveTextContent(/UUID/i);
  });

  it('uses payload fallbacks and generic errors', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (command: OrdersCommand) => {
      if (command.action === 'accept') {
        return { ok: true };
      }
      if (command.action === 'advanceStatus') {
        return { ok: true };
      }
      if (command.action === 'assignRider') {
        return { ok: true };
      }
      return { ok: false, code: 'VALIDATION_ERROR' };
    });
    render(<OrdersMfe data={data(feature('order-actions', onSubmit))} />);
    await user.click(screen.getByRole('button', { name: 'Accept' }));
    expect(await screen.findByTestId('orders-cached-status')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'PACKED' }));
    await user.type(screen.getByLabelText('Rider id'), RIDER_ID);
    await user.click(screen.getByRole('button', { name: 'Assign rider' }));
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    await user.click(screen.getByRole('button', { name: 'Confirm reject' }));
    expect(screen.getByTestId('orders-actions-error')).toHaveTextContent(
      'VALIDATION_ERROR',
    );
  });

  it('picks a directory rider and shows pickup OTP from assign', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (command: OrdersCommand) => {
      if (command.action === 'listRiders') {
        return {
          ok: true as const,
          riders: [
            { rider_id: RIDER_ID, name: 'Ravi' },
            { rider_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' },
          ],
        };
      }
      if (command.action === 'loadHandoff') {
        return {
          ok: true as const,
          handoff: {
            order_id: ORDER_ID,
            pickup_otp: '4321',
            rider_id: RIDER_ID,
          },
        };
      }
      if (command.action === 'assignRider') {
        return {
          ok: true as const,
          assign: {
            order_id: ORDER_ID,
            rider_id: RIDER_ID,
            pickup_otp: '5678',
          },
        };
      }
      return { ok: true as const };
    });
    render(<OrdersMfe data={data(feature('order-actions', onSubmit))} />);
    expect(await screen.findByText('4321')).toBeTruthy();
    await user.selectOptions(screen.getByLabelText('Rider'), RIDER_ID);
    await user.click(screen.getByRole('button', { name: 'Assign rider' }));
    expect(await screen.findByText('5678')).toBeTruthy();
    expect(onSubmit).toHaveBeenCalledWith({
      screen: 'order-actions',
      action: 'assignRider',
      values: { orderId: ORDER_ID, rider_id: RIDER_ID },
    });
  });
});

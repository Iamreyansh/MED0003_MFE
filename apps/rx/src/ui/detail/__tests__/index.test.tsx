import type { RxCommand, RxSubmitResult } from '@medmate/rx-contract';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  RX_APPROVED,
  RX_DETAIL,
  data,
  feature,
} from '../../../app/__tests__/helpers';
import RxMfe from '../../../app/RxMfe';

afterEach(() => {
  cleanup();
});

function detailSubmit(
  overrides: Partial<
    Record<RxCommand['action'], () => Promise<RxSubmitResult>>
  > = {},
  loaded: RxSubmitResult = RX_DETAIL,
) {
  return vi.fn(async (command: RxCommand): Promise<RxSubmitResult> => {
    const override = overrides[command.action];
    if (override) {
      return override();
    }
    if (command.action === 'load') {
      return loaded;
    }
    return { ok: true };
  });
}

describe('DetailScreen', () => {
  it('shows lines, schedule, and image', async () => {
    render(<RxMfe data={data(feature('detail', detailSubmit()))} />);
    expect(await screen.findByTestId('rx-lines-table')).toBeTruthy();
    expect(screen.getByText('Alprazolam 0.25mg')).toBeTruthy();
    expect(screen.getByTestId('rx-image')).toHaveAttribute(
      'src',
      'https://core.example/rx.png',
    );
    expect(screen.getByRole('button', { name: 'Approve' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeTruthy();
  });

  it('shows not-found and plan lock', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const { rerender } = render(
      <RxMfe
        data={data(
          feature('detail', async () => ({
            ok: false,
            code: 'RX_NOT_FOUND',
          })),
        )}
      />,
    );
    expect(await screen.findByTestId('rx-detail-not-found')).toBeTruthy();
    rerender(
      <RxMfe
        data={data(
          feature('detail', async () => ({
            ok: false,
            code: 'PLAN_FEATURE_LOCKED',
          })),
          { capabilities: { navigate: onNavigate } },
        )}
      />,
    );
    expect(await screen.findByTestId('rx-detail-plan-lock')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'View plans' }));
    expect(onNavigate).toHaveBeenCalledWith('/subscription');
    rerender(
      <RxMfe
        data={data(
          feature(
            'detail',
            async () => ({
              ok: false,
              code: 'PLAN_FEATURE_LOCKED',
              formError: '',
            }),
            { role: 'pharmacy_staff' },
          ),
        )}
      />,
    );
    expect(await screen.findByTestId('rx-detail-plan-lock')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'View plans' })).toBeNull();
  });

  it('treats a successful load without a payload as empty', async () => {
    render(
      <RxMfe data={data(feature('detail', async () => ({ ok: true })))} />,
    );
    expect(await screen.findByText(/No lines/i)).toBeTruthy();
  });

  it('approves and hides mutates for cashiers', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit({
      approve: async () => ({ ok: true, approve: { status: 'APPROVED' } }),
    });
    const { rerender } = render(
      <RxMfe data={data(feature('detail', onSubmit))} />,
    );
    await screen.findByRole('button', { name: 'Approve' });
    await user.click(screen.getByRole('button', { name: 'Approve' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        screen: 'detail',
        action: 'approve',
        values: { rxId: 'rx-1' },
      });
    });
    rerender(
      <RxMfe
        data={data(
          feature('detail', detailSubmit(), {
            canMutateRx: false,
            role: 'pharmacy_staff',
          }),
        )}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();
  });

  it('requires a reason and cancels reject without posting', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit();
    render(<RxMfe data={data(feature('detail', onSubmit))} />);
    await user.click(await screen.findByRole('button', { name: 'Reject' }));
    expect(screen.getByTestId('rx-reject-dialog')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.queryByTestId('rx-reject-dialog')).toBeNull();
    });
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    await user.click(screen.getByRole('button', { name: 'Confirm reject' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a reason.');
    expect(
      onSubmit.mock.calls.some((call) => call[0].action === 'reject'),
    ).toBe(false);
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByTestId('rx-reject-dialog')).toBeNull();
    });
  });

  it('rejects with a labelled reason', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit({
      reject: async () => ({ ok: true, reject: { status: 'REJECTED' } }),
    });
    render(<RxMfe data={data(feature('detail', onSubmit))} />);
    await user.click(await screen.findByRole('button', { name: 'Reject' }));
    await user.type(screen.getByLabelText('Rejection reason'), 'Illegible');
    await user.click(screen.getByRole('button', { name: 'Confirm reject' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        screen: 'detail',
        action: 'reject',
        values: { rxId: 'rx-1', reason: 'Illegible' },
      });
    });
  });

  it('confirms controlled dispense and maps stock errors', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit(
      {
        dispense: async () => ({
          ok: false,
          code: 'INSUFFICIENT_STOCK',
          formError: 'Stock is insufficient to dispense.',
        }),
      },
      RX_APPROVED,
    );
    render(<RxMfe data={data(feature('detail', onSubmit))} />);
    await user.click(await screen.findByRole('button', { name: 'Dispense' }));
    expect(screen.getByTestId('rx-dispense-dialog')).toHaveTextContent(
      /Schedule H1 or X/i,
    );
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByTestId('rx-dispense-dialog')).toBeNull();
    });
    await user.click(screen.getByRole('button', { name: 'Dispense' }));
    await user.click(screen.getByRole('button', { name: 'Confirm dispense' }));
    expect(await screen.findByTestId('rx-detail-error')).toHaveTextContent(
      /insufficient/i,
    );
  });

  it('maps approve and generic dispense failures', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit({
      approve: async () => ({ ok: false, formError: 'Already dispensed' }),
    });
    render(<RxMfe data={data(feature('detail', onSubmit))} />);
    await user.click(await screen.findByRole('button', { name: 'Approve' }));
    expect(await screen.findByTestId('rx-detail-error')).toHaveTextContent(
      'Already dispensed',
    );
    const dispenseSubmit = detailSubmit(
      {
        dispense: async () => ({ ok: false, formError: 'Illegal state' }),
      },
      RX_APPROVED,
    );
    cleanup();
    render(<RxMfe data={data(feature('detail', dispenseSubmit))} />);
    await user.click(await screen.findByRole('button', { name: 'Dispense' }));
    await user.click(screen.getByRole('button', { name: 'Confirm dispense' }));
    expect(await screen.findByTestId('rx-detail-error')).toHaveTextContent(
      'Illegal state',
    );
  });

  it('uses standard dispense copy when not controlled', async () => {
    const user = userEvent.setup();
    render(
      <RxMfe
        data={data(
          feature('detail', async () => ({
            ok: true,
            prescription: {
              rx_id: 'rx-1',
              status: 'APPROVED',
              lines: [{ product_name: 'Crocin', quantity: 1 }],
            },
          })),
        )}
      />,
    );
    await user.click(await screen.findByRole('button', { name: 'Dispense' }));
    expect(screen.getByTestId('rx-dispense-dialog')).toHaveTextContent(
      /records the dispense/i,
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
  });

  it('dispenses an approved prescription', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit(
      {
        dispense: async () => ({
          ok: true,
          dispense: { status: 'DISPENSED' },
        }),
      },
      RX_APPROVED,
    );
    render(<RxMfe data={data(feature('detail', onSubmit))} />);
    await user.click(await screen.findByRole('button', { name: 'Dispense' }));
    await user.click(screen.getByRole('button', { name: 'Confirm dispense' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        screen: 'detail',
        action: 'dispense',
        values: { rxId: 'rx-1' },
      });
    });
  });

  it('maps reject field errors and generic dispense failures', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit({
      reject: async () => ({
        ok: false,
        formError: 'Need more detail',
        fieldErrors: { reason: 'Too short' },
      }),
    });
    render(<RxMfe data={data(feature('detail', onSubmit))} />);
    await user.click(await screen.findByRole('button', { name: 'Reject' }));
    await user.type(screen.getByLabelText('Rejection reason'), 'No');
    await user.click(screen.getByRole('button', { name: 'Confirm reject' }));
    expect(await screen.findByTestId('rx-detail-error')).toHaveTextContent(
      'Need more detail',
    );
  });

  it('retries a failed load and missing rxId', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit({
      load: vi
        .fn()
        .mockResolvedValueOnce({ ok: false, formError: 'Down' })
        .mockResolvedValue(RX_DETAIL),
    });
    const { rerender } = render(
      <RxMfe data={data(feature('detail', onSubmit))} />,
    );
    expect(await screen.findByTestId('rx-detail-error')).toHaveTextContent(
      'Down',
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByTestId('rx-lines-table')).toBeTruthy();
    rerender(
      <RxMfe data={data(feature('detail', onSubmit, { rxId: null }))} />,
    );
    expect(await screen.findByTestId('rx-detail-not-found')).toBeTruthy();
  });

  it('skips unsafe images and empty lines', async () => {
    render(
      <RxMfe
        data={data(
          feature('detail', async () => ({
            ok: true,
            prescription: {
              rx_id: 'rx-1',
              status: 'PENDING_REVIEW',
              image_url: 'javascript:alert(1)',
              lines: [],
            },
          })),
        )}
      />,
    );
    expect(await screen.findByText(/No lines/i)).toBeTruthy();
    expect(screen.queryByTestId('rx-image')).toBeNull();
  });
});

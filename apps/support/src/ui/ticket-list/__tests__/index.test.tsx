import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TICKET_ID, data, feature } from '../../../app/__tests__/helpers';
import SupportMfe from '../../../app/SupportMfe';

afterEach(() => {
  cleanup();
});

describe('TicketListScreen', () => {
  it('lists tickets and opens detail', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => ({
      ok: true as const,
      tickets: [{ id: TICKET_ID, subject: 'Printer', status: 'OPEN' }],
      meta: { has_next: false },
    }));
    const navigate = vi.fn();
    render(
      <SupportMfe
        data={{
          ...data(feature('ticket-list', onSubmit)),
          capabilities: { navigate },
        }}
      />,
    );
    expect(await screen.findByTestId('ticket-list-table')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(navigate).toHaveBeenCalledWith(`/support/tickets/${TICKET_ID}`);
    await user.click(screen.getByRole('button', { name: 'New ticket' }));
    expect(navigate).toHaveBeenCalledWith('/support/new');
  });

  it('shows empty and forbidden states', async () => {
    render(
      <SupportMfe
        data={data(
          feature('ticket-list', async () => ({ ok: true, tickets: [] })),
        )}
      />,
    );
    expect(await screen.findByTestId('ticket-list-empty')).toBeTruthy();
    cleanup();
    render(
      <SupportMfe
        data={data(
          feature('ticket-list', async () => ({ ok: true }), {
            canUseTickets: false,
            tokenScope: 'pos',
          }),
        )}
      />,
    );
    expect(screen.getByTestId('ticket-list-forbidden')).toBeTruthy();
    cleanup();
    render(
      <SupportMfe
        data={data(
          feature('ticket-list', async () => ({ ok: true }), {
            canUseTickets: false,
            tokenScope: 'full',
          }),
        )}
      />,
    );
    expect(screen.getByTestId('ticket-list-forbidden')).toHaveTextContent(
      'permission',
    );
  });

  it('maps load errors, unnamed rows, and pager', async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        formError: 'Unable to load tickets.',
      })
      .mockResolvedValue({
        ok: true,
        tickets: [{ subject: 'No id', status: 'OPEN' }],
        meta: { has_next: true },
      });
    const navigate = vi.fn();
    render(
      <SupportMfe
        data={{
          ...data(feature('ticket-list', onSubmit)),
          capabilities: { navigate },
        }}
      />,
    );
    expect(await screen.findByTestId('ticket-list-error')).toHaveTextContent(
      'Unable to load tickets.',
    );
    cleanup();
    render(
      <SupportMfe
        data={{
          ...data(feature('ticket-list', onSubmit)),
          capabilities: { navigate },
        }}
      />,
    );
    expect(await screen.findByTestId('ticket-list-table')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(await screen.findByTestId('ticket-list-table')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(await screen.findByTestId('ticket-list-table')).toBeTruthy();
    expect(onSubmit.mock.calls.length).toBeGreaterThan(2);
    expect(navigate).not.toHaveBeenCalled();
  });
});

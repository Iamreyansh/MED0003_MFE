import type {
  SupportCommand,
  SupportSubmitResult,
} from '@medmate/support-contract';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  OPEN_TICKET,
  RESOLVED_TICKET,
  TICKET_ID,
  data,
  feature,
} from '../../../app/__tests__/helpers';
import SupportMfe from '../../../app/SupportMfe';

afterEach(() => {
  cleanup();
});

function detailSubmit(
  overrides: Partial<
    Record<SupportCommand['action'], () => Promise<SupportSubmitResult>>
  > = {},
  ticket: SupportSubmitResult = OPEN_TICKET,
) {
  return vi.fn(
    async (command: SupportCommand): Promise<SupportSubmitResult> => {
      const override = overrides[command.action];
      if (override) {
        return override();
      }
      if (command.action === 'load') {
        return ticket;
      }
      return ticket;
    },
  );
}

describe('TicketDetailScreen', () => {
  it('renders Core fields, replies, and hides escalate', async () => {
    render(
      <SupportMfe data={data(feature('ticket-detail', detailSubmit()))} />,
    );
    expect(await screen.findByTestId('ticket-description')).toHaveTextContent(
      'Counter 1 cannot print invoices.',
    );
    expect(screen.getByTestId('ticket-replies')).toHaveTextContent(
      'We are checking the driver.',
    );
    expect(screen.queryByRole('button', { name: /escalate/i })).toBeNull();
    expect(screen.queryByLabelText(/internal note/i)).toBeNull();
    expect(screen.queryByTestId('ticket-csat-submit')).toBeNull();
  });

  it('validates empty reply and refreshes after a valid reply', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit();
    render(<SupportMfe data={data(feature('ticket-detail', onSubmit))} />);
    await screen.findByTestId('ticket-reply-submit');
    await user.click(screen.getByTestId('ticket-reply-submit'));
    expect(screen.getByText('Enter a reply.')).toBeTruthy();
    expect(onSubmit.mock.calls.some((call) => call[0].action === 'reply')).toBe(
      false,
    );
    await user.type(screen.getByLabelText('Reply'), 'Still offline');
    await user.click(screen.getByTestId('ticket-reply-submit'));
    expect(onSubmit).toHaveBeenCalledWith({
      screen: 'ticket-detail',
      action: 'reply',
      values: { ticketId: TICKET_ID, body: 'Still offline' },
    });
  });

  it('submits CSAT once and reopens with a reason', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit({}, RESOLVED_TICKET);
    render(<SupportMfe data={data(feature('ticket-detail', onSubmit))} />);
    expect(await screen.findByTestId('ticket-csat-submit')).toBeTruthy();
    await user.click(screen.getByTestId('ticket-csat-5'));
    await user.click(screen.getByTestId('ticket-csat-submit'));
    expect(onSubmit).toHaveBeenCalledWith({
      screen: 'ticket-detail',
      action: 'csat',
      values: { ticketId: TICKET_ID, rating: 5 },
    });
    await user.click(screen.getByTestId('ticket-csat-submit'));
    expect(
      onSubmit.mock.calls.filter((call) => call[0].action === 'csat'),
    ).toHaveLength(1);
    await user.click(screen.getByTestId('ticket-reopen-submit'));
    expect(screen.getByText('Enter a reason to reopen.')).toBeTruthy();
    await user.type(
      screen.getByLabelText('Reopen reason'),
      'Printer failed again',
    );
    await user.click(screen.getByTestId('ticket-reopen-submit'));
    expect(onSubmit).toHaveBeenCalledWith({
      screen: 'ticket-detail',
      action: 'reopen',
      values: { ticketId: TICKET_ID, reason: 'Printer failed again' },
    });
  });

  it('shows not-found, missing id, forbidden, and retries load errors', async () => {
    render(
      <SupportMfe
        data={data(
          feature(
            'ticket-detail',
            async () => ({ ok: false, code: 'TICKET_NOT_FOUND' }),
            { ticketId: 'missing' },
          ),
        )}
      />,
    );
    expect(await screen.findByTestId('ticket-not-found')).toBeTruthy();
    cleanup();
    render(
      <SupportMfe
        data={data(
          feature('ticket-detail', async () => ({ ok: true }), {
            ticketId: null,
          }),
        )}
      />,
    );
    expect(await screen.findByTestId('ticket-not-found')).toBeTruthy();
    cleanup();
    render(
      <SupportMfe
        data={data(
          feature('ticket-detail', async () => ({
            ok: false,
            code: 'FORBIDDEN',
          })),
        )}
      />,
    );
    expect(await screen.findByTestId('ticket-not-found')).toBeTruthy();
    expect(screen.queryByTestId('ticket-description')).toBeNull();
    cleanup();
    const onSubmit = detailSubmit({
      load: vi
        .fn()
        .mockResolvedValueOnce({ ok: false, formError: 'Down' })
        .mockResolvedValue(OPEN_TICKET),
    });
    render(<SupportMfe data={data(feature('ticket-detail', onSubmit))} />);
    expect(await screen.findByTestId('ticket-detail-error')).toHaveTextContent(
      'Down',
    );
    cleanup();
    render(
      <SupportMfe
        data={data(
          feature('ticket-detail', async () => ({ ok: true }), {
            canUseTickets: false,
          }),
        )}
      />,
    );
    expect(screen.getByTestId('ticket-detail-forbidden')).toBeTruthy();
    cleanup();
    render(
      <SupportMfe
        data={data(
          feature('ticket-detail', async () => ({ ok: true }), {
            canUseTickets: false,
            tokenScope: 'pos',
          }),
        )}
      />,
    );
    expect(screen.getByTestId('ticket-detail-forbidden')).toHaveTextContent(
      'session',
    );
  });

  it('refreshes detail when a mutation omits the ticket and shows empty replies', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (command: SupportCommand) => {
      if (command.action === 'reply') {
        return { ok: true as const };
      }
      return {
        ok: true as const,
        ticket: {
          id: TICKET_ID,
          subject: 'POS printer offline',
          description: 'Counter 1 cannot print invoices.',
          status: 'OPEN',
          replies: [{}],
        },
      };
    });
    render(<SupportMfe data={data(feature('ticket-detail', onSubmit))} />);
    expect(await screen.findByTestId('ticket-replies')).toBeTruthy();
    await user.type(screen.getByLabelText('Reply'), 'Any update?');
    await user.click(screen.getByTestId('ticket-reply-submit'));
    expect(
      onSubmit.mock.calls.filter((call) => call[0].action === 'load'),
    ).toHaveLength(2);
    cleanup();
    let loads = 0;
    const mixed = vi.fn(async (command: SupportCommand) => {
      if (command.action === 'reply') {
        return { ok: true as const };
      }
      loads += 1;
      if (loads === 1) {
        return OPEN_TICKET;
      }
      return { ok: true as const };
    });
    render(<SupportMfe data={data(feature('ticket-detail', mixed))} />);
    await user.type(await screen.findByLabelText('Reply'), 'Ping');
    await user.click(screen.getByTestId('ticket-reply-submit'));
    expect(loads).toBe(2);
  });

  it('surfaces FORBIDDEN mutations without an upgrade CTA', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit({
      reply: async () => ({
        ok: false,
        code: 'FORBIDDEN',
        formError: 'You do not have permission to do that.',
      }),
    });
    render(<SupportMfe data={data(feature('ticket-detail', onSubmit))} />);
    await user.type(await screen.findByLabelText('Reply'), 'Please reopen');
    await user.click(screen.getByTestId('ticket-reply-submit'));
    expect(screen.getByTestId('ticket-detail-error')).toHaveTextContent(
      'permission',
    );
    expect(screen.queryByText(/upgrade/i)).toBeNull();
  });

  it('surfaces FORBIDDEN CSAT and reopen without an upgrade CTA', async () => {
    const user = userEvent.setup();
    const onSubmit = detailSubmit(
      {
        csat: async () => ({
          ok: false,
          code: 'FORBIDDEN',
          formError: 'You do not have permission to do that.',
        }),
        reopen: async () => ({
          ok: false,
          code: 'FORBIDDEN',
          formError: 'You do not have permission to do that.',
        }),
      },
      RESOLVED_TICKET,
    );
    render(<SupportMfe data={data(feature('ticket-detail', onSubmit))} />);
    await user.click(await screen.findByTestId('ticket-csat-4'));
    await user.click(screen.getByTestId('ticket-csat-submit'));
    expect(screen.getByTestId('ticket-detail-error')).toHaveTextContent(
      'permission',
    );
    expect(screen.queryByText(/upgrade/i)).toBeNull();
    await user.type(screen.getByLabelText('Reopen reason'), 'Still broken');
    await user.click(screen.getByTestId('ticket-reopen-submit'));
    expect(onSubmit).toHaveBeenCalledWith({
      screen: 'ticket-detail',
      action: 'reopen',
      values: { ticketId: TICKET_ID, reason: 'Still broken' },
    });
  });
});

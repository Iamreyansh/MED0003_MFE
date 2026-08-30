import type { SupportCommand } from '@medmate/support-contract';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TICKET_ID, data, feature } from '../../../app/__tests__/helpers';
import SupportMfe from '../../../app/SupportMfe';

afterEach(() => {
  cleanup();
});

describe('TicketNewScreen', () => {
  it('validates subject and navigates after create', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const onSubmit = vi.fn(async (command: SupportCommand) => {
      expect(command.action).toBe('create');
      return { ok: true as const, ticketId: TICKET_ID };
    });
    render(
      <SupportMfe
        data={data(feature('ticket-new', onSubmit), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    await user.click(screen.getByTestId('ticket-create'));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onNavigate).not.toHaveBeenCalled();
    expect(screen.getByText('Enter a subject.')).toBeTruthy();
    await user.type(screen.getByLabelText('Subject'), 'Printer down');
    await user.type(screen.getByLabelText('Description'), 'Counter 1');
    await user.click(screen.getByTestId('ticket-create'));
    expect(onSubmit).toHaveBeenCalledWith({
      screen: 'ticket-new',
      action: 'create',
      values: {
        subject: 'Printer down',
        description: 'Counter 1',
        category: 'PHARMACY',
      },
    });
    expect(onNavigate).toHaveBeenCalledWith(`/support/tickets/${TICKET_ID}`);
  });

  it('keeps the form on validation failure and hides POS', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const onSubmit = vi.fn(async () => ({
      ok: false as const,
      code: 'VALIDATION_ERROR',
      fieldErrors: { subject: 'Too short' },
      formError: 'Check the highlighted fields and try again.',
    }));
    render(
      <SupportMfe
        data={data(feature('ticket-new', onSubmit), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    await user.type(screen.getByLabelText('Subject'), 'Hi');
    await user.click(screen.getByTestId('ticket-create'));
    expect(onNavigate).not.toHaveBeenCalled();
    expect(screen.getByTestId('ticket-new-error')).toHaveTextContent(
      'Check the highlighted fields',
    );
    cleanup();
    render(
      <SupportMfe
        data={data(
          feature('ticket-new', async () => ({ ok: true }), {
            canUseTickets: false,
            tokenScope: 'pos',
          }),
        )}
      />,
    );
    expect(screen.getByTestId('ticket-new-forbidden')).toBeTruthy();
    expect(screen.queryByTestId('ticket-create')).toBeNull();
    cleanup();
    render(
      <SupportMfe
        data={data(
          feature('ticket-new', async () => ({ ok: true }), {
            canUseTickets: false,
            tokenScope: 'full',
          }),
        )}
      />,
    );
    expect(screen.getByTestId('ticket-new-forbidden')).toHaveTextContent(
      'permission',
    );
  });

  it('navigates using the ticket object when ticketId is omitted', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <SupportMfe
        data={data(
          feature('ticket-new', async () => ({
            ok: true,
            ticket: { id: TICKET_ID },
          })),
          { capabilities: { navigate: onNavigate } },
        )}
      />,
    );
    await user.type(screen.getByLabelText('Subject'), 'Need help');
    await user.click(screen.getByTestId('ticket-create'));
    expect(onNavigate).toHaveBeenCalledWith(`/support/tickets/${TICKET_ID}`);
    cleanup();
    onNavigate.mockClear();
    render(
      <SupportMfe
        data={data(
          feature('ticket-new', async () => ({ ok: true })),
          {
            capabilities: { navigate: onNavigate },
          },
        )}
      />,
    );
    await user.type(screen.getByLabelText('Subject'), 'Need help');
    await user.click(screen.getByTestId('ticket-create'));
    expect(onNavigate).not.toHaveBeenCalled();
  });
});

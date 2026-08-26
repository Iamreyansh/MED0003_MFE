import type { AuthSubmitResult } from '@medmate/auth-contract';
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature } from '../../../app/__tests__/helpers';
import AuthMfe from '../../../app/AuthMfe';
import { SESSION_FIXTURES } from '../mock';

afterEach(() => {
  cleanup();
});

describe('SessionsScreen', () => {
  it('lists and revokes sessions', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (command) => {
      if (command.action === 'list') {
        return {
          ok: true,
          sessions: SESSION_FIXTURES,
          page: 1,
          hasNext: true,
        };
      }
      return { ok: true };
    });
    render(<AuthMfe data={data(feature('sessions', onSubmit))} />);
    expect(await screen.findByText(/Chrome/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Revoke' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await user.click(screen.getByRole('button', { name: 'Revoke' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Revoke',
      }),
    );
    await waitFor(() => {
      expect(
        onSubmit.mock.calls.some((call) => call[0].action === 'revoke'),
      ).toBe(true);
    });
  });

  it('renders an empty session list and list errors', async () => {
    const onSubmit = vi.fn(async () => ({
      ok: false,
      formError: 'UNKNOWN',
    }));
    render(<AuthMfe data={data(feature('sessions', onSubmit))} />);
    expect(await screen.findByText('UNKNOWN')).toBeTruthy();
    cleanup();
    render(
      <AuthMfe
        data={data(
          feature('sessions', async () => ({ ok: true, sessions: [] }), {
            sessions: [],
          }),
        )}
      />,
    );
    expect(screen.getByTestId('sessions-empty')).toBeTruthy();
  });

  it('covers pagination, revoke failure, loading, and sparse rows', async () => {
    const user = userEvent.setup();
    const revokeFail = vi.fn(async (command) => {
      if (command.action === 'list') {
        return {
          ok: true,
          sessions: [{ sessionId: 's1', device: 'Pad' }],
          page: 2,
          hasNext: false,
        };
      }
      return { ok: false, formError: 'NOPE' };
    });
    render(<AuthMfe data={data(feature('sessions', revokeFail))} />);
    expect(await screen.findByText('Pad')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    await user.click(screen.getByRole('button', { name: 'Revoke' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Revoke',
      }),
    );
    expect(await screen.findByText('NOPE')).toBeTruthy();
    cleanup();

    render(
      <AuthMfe
        data={data(
          feature('sessions', async () => ({
            ok: false,
            code: 'GONE',
          })),
        )}
      />,
    );
    expect(await screen.findByText('GONE')).toBeTruthy();
    cleanup();

    let resolveList: (value: AuthSubmitResult) => void = () => undefined;
    const deferred = new Promise<AuthSubmitResult>((resolve) => {
      resolveList = resolve;
    });
    render(<AuthMfe data={data(feature('sessions', async () => deferred))} />);
    expect(screen.getByText('Loading sessions…')).toBeTruthy();
    resolveList({ ok: true });
    expect(await screen.findByTestId('sessions-empty')).toBeTruthy();
    cleanup();

    const sparseSessions = vi.fn(async (command) => {
      if (command.action === 'list') {
        return { ok: true, hasNext: false };
      }
      return { ok: false };
    });
    render(<AuthMfe data={data(feature('sessions', sparseSessions))} />);
    expect(await screen.findByTestId('sessions-empty')).toBeTruthy();
    cleanup();

    const noDevice = vi.fn(async (command) => {
      if (command.action === 'list') {
        return {
          ok: true,
          sessions: [{ sessionId: 's9' }],
        };
      }
      return { ok: false };
    });
    render(<AuthMfe data={data(feature('sessions', noDevice))} />);
    expect(await screen.findByText('Unknown device')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Revoke' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Revoke',
      }),
    );
    expect(await screen.findByText('UNKNOWN')).toBeTruthy();
    cleanup();

    render(
      <AuthMfe data={data(feature('sessions', async () => ({ ok: false })))} />,
    );
    expect(await screen.findByText('UNKNOWN')).toBeTruthy();
  });
});

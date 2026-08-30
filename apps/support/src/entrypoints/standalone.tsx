/**
 * Standalone harness — shared mfe-kit bootstrap only.
 */
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { mountStandalone, StandaloneShell } from '@medmate/mfe-kit';
import {
  SUPPORT_SCREENS,
  isSupportScreen,
  type SupportCommand,
  type SupportFeatureData,
  type SupportScreen,
  type SupportSubmitResult,
} from '@medmate/support-contract';
import { Button, Inline, StatusMessage } from '@medmate/ui';
import { useMemo, useState } from 'react';
import SupportMfe from '../app/SupportMfe';
import type { SupportMfeProps } from '../contract';
import '@medmate/ui/styles.css';

const TICKET_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const ARTICLE_ID = 'hours';
const USER_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

function readScreen(): SupportScreen {
  if (typeof window === 'undefined') {
    return 'ticket-new';
  }
  const value = new URLSearchParams(window.location.search).get('screen');
  return isSupportScreen(value) ? value : 'ticket-new';
}

function mockSubmit(command: SupportCommand): SupportSubmitResult {
  if (command.screen === 'ticket-new' && command.action === 'create') {
    return { ok: true, ticketId: TICKET_ID };
  }
  if (command.screen === 'ticket-detail' && command.action === 'load') {
    if (command.values.ticketId === 'missing') {
      return { ok: false, code: 'TICKET_NOT_FOUND' };
    }
    return {
      ok: true,
      ticket: {
        id: TICKET_ID,
        subject: 'POS printer offline',
        description: 'Counter 1 cannot print invoices.',
        status: 'RESOLVED',
        customer_id: USER_ID,
        replies: [{ id: 'r-1', body: 'Replaced the cable.' }],
      },
    };
  }
  if (command.screen === 'ticket-detail' && command.action === 'reply') {
    return {
      ok: true,
      ticket: {
        id: TICKET_ID,
        subject: 'POS printer offline',
        description: 'Counter 1 cannot print invoices.',
        status: 'RESOLVED',
        customer_id: USER_ID,
        replies: [
          { id: 'r-1', body: 'Replaced the cable.' },
          { id: 'r-2', body: command.values.body },
        ],
      },
    };
  }
  if (command.screen === 'help' && command.action === 'load') {
    return {
      ok: true,
      articles: [{ id: ARTICLE_ID, title: 'Store opening hours' }],
    };
  }
  if (command.screen === 'help-article' && command.action === 'load') {
    if (command.values.articleId === 'missing') {
      return { ok: false, code: 'HELP_ARTICLE_NOT_FOUND' };
    }
    return {
      ok: true,
      article: {
        id: ARTICLE_ID,
        title: 'Store opening hours',
        body: 'Update hours from Settings → Profile.',
      },
    };
  }
  return { ok: true };
}

function StandaloneHarness() {
  const [screen, setScreen] = useState<SupportScreen>(readScreen);
  const [log, setLog] = useState('Ready');

  const feature = useMemo<SupportFeatureData>(
    () => ({
      screen,
      role: 'pharmacy_owner',
      plan: 'FREE',
      canUseTickets: true,
      authenticated: true,
      ticketId: screen === 'ticket-detail' ? TICKET_ID : null,
      articleId: screen === 'help-article' ? ARTICLE_ID : null,
      tokenScope: 'full',
      userId: USER_ID,
      onSubmit: async (command) => {
        setLog((current) => `${current} ${command.screen}:${command.action}`);
        return mockSubmit(command);
      },
    }),
    [screen],
  );

  const data = useMemo<SupportMfeProps['data']>(
    () => ({
      contractVersion: MFE_CONTRACT_VERSION,
      context: {
        hostId: 'support-standalone',
        locale: 'en-IN',
        permissions: [],
        userId: USER_ID,
      },
      feature,
      capabilities: {
        navigate: (path) => setLog(`navigate:${path}`),
        api: {
          request: async <T = unknown,>() => ({
            ok: true,
            status: 200,
            data: {} as T,
          }),
        },
      },
    }),
    [feature],
  );

  return (
    <StandaloneShell
      title="Support standalone harness"
      description="Preview ticket create, detail, and public help."
      className="max-w-5xl"
    >
      <Inline wrap className="mb-4">
        {SUPPORT_SCREENS.map((type) => (
          <Button
            key={type}
            type="button"
            variant={type === screen ? 'primary' : 'ghost'}
            onClick={() => setScreen(type)}
          >
            {type}
          </Button>
        ))}
      </Inline>
      <SupportMfe data={data} />
      <StatusMessage>{log}</StatusMessage>
    </StandaloneShell>
  );
}

mountStandalone(<StandaloneHarness />);

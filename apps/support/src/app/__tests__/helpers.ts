import type { MfeDataEnvelope } from '@medmate/contracts';
import type {
  SupportFeatureData,
  SupportScreen,
  SupportSubmitResult,
} from '@medmate/support-contract';
import { createMfeEnvelope } from '@medmate/test-utils';

export const TICKET_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
export const ARTICLE_ID = 'hours';
export const USER_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

export function feature(
  screen: SupportScreen,
  onSubmit: SupportFeatureData['onSubmit'] = async () => ({ ok: true }),
  extra: Partial<SupportFeatureData> = {},
): SupportFeatureData {
  return {
    screen,
    onSubmit,
    role: 'pharmacy_owner',
    plan: 'FREE',
    canUseTickets: true,
    authenticated: true,
    ticketId: screen === 'ticket-detail' ? TICKET_ID : null,
    articleId: screen === 'help-article' ? ARTICLE_ID : null,
    tokenScope: 'full',
    userId: USER_ID,
    ...extra,
  };
}

export function data(
  next: SupportFeatureData,
  extra: Partial<MfeDataEnvelope<SupportFeatureData>> = {},
) {
  return {
    ...createMfeEnvelope({
      feature: next,
      context: { hostId: 'test-host', locale: 'en-IN', permissions: [] },
    }),
    ...extra,
  };
}

export const OPEN_TICKET: SupportSubmitResult = {
  ok: true,
  ticket: {
    id: TICKET_ID,
    subject: 'POS printer offline',
    description: 'Counter 1 cannot print invoices.',
    status: 'OPEN',
    customer_id: USER_ID,
    replies: [{ id: 'r-1', body: 'We are checking the driver.' }],
  },
  ticketId: TICKET_ID,
};

export const RESOLVED_TICKET: SupportSubmitResult = {
  ok: true,
  ticket: {
    id: TICKET_ID,
    subject: 'POS printer offline',
    description: 'Counter 1 cannot print invoices.',
    status: 'RESOLVED',
    customer_id: USER_ID,
    replies: [{ id: 'r-1', body: 'Replaced the cable.' }],
  },
  ticketId: TICKET_ID,
};

export const HELP_LIST: SupportSubmitResult = {
  ok: true,
  articles: [{ id: ARTICLE_ID, title: 'Store opening hours' }],
};

export const HELP_ARTICLE: SupportSubmitResult = {
  ok: true,
  article: {
    id: ARTICLE_ID,
    title: 'Store opening hours',
    body: 'Update hours from Settings → Profile.',
  },
};

import type { SupportScreen } from '@medmate/support-contract';

export const SCREEN_COPY: Record<
  SupportScreen,
  { title: string; helper: string; kicker: string }
> = {
  'ticket-list': {
    title: 'Support tickets',
    helper:
      'Open tickets for this pharmacy. Create a new one if you do not see it.',
    kicker: 'Support',
  },
  'ticket-new': {
    title: 'New support ticket',
    helper: 'Describe the issue. We open the ticket by id after you submit.',
    kicker: 'Support',
  },
  'ticket-detail': {
    title: 'Support ticket',
    helper: 'Core fields only. Reply on this id.',
    kicker: 'Support',
  },
  help: {
    title: 'Help centre',
    helper: 'Browse public articles. Raise a ticket if you still need help.',
    kicker: 'Help',
  },
  'help-article': {
    title: 'Help article',
    helper: 'Article text from Core. Tell us if this answered the question.',
    kicker: 'Help',
  },
};

export function rootTestId(screen: SupportScreen): string {
  return `support-${screen}-page`;
}

export function errorText(
  result: { formError?: string; code?: string },
  fallback = 'Unable to continue.',
): string {
  return result.formError ?? result.code ?? fallback;
}

export function dash(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  return String(value);
}

export function listOf<T>(value: T[] | null | undefined): T[] {
  return value ?? [];
}

export const TICKET_COPY = {
  subject: 'Subject',
  description: 'Description',
  submit: 'Create ticket',
  subjectRequired: 'Enter a subject.',
  creating: 'Creating ticket',
  replies: 'Replies',
  noReplies: 'No replies yet.',
  reply: 'Reply',
  replyLabel: 'Reply',
  replyRequired: 'Enter a reply.',
  sendReply: 'Send reply',
  csat: 'Was this resolved?',
  csatHint: 'Rate this ticket once it is resolved.',
  rating: 'Satisfaction rating',
  sendCsat: 'Submit rating',
  reopen: 'Reopen ticket',
  reopenReason: 'Reopen reason',
  reopenRequired: 'Enter a reason to reopen.',
  notFound: 'This ticket was not found.',
  forbidden: 'You do not have permission to do that.',
  retry: 'Retry',
  loading: 'Loading ticket',
  thread: 'Conversation',
} as const;

export const TICKET_LIST_COPY = {
  empty: 'No tickets yet.',
  tableLabel: 'Support tickets',
  retry: 'Retry',
  open: 'Open',
  previous: 'Previous page',
  next: 'Next page',
  page: 'Page',
  newTicket: 'New ticket',
} as const;

export const HELP_COPY = {
  empty: 'No help articles are published yet.',
  retry: 'Retry',
  loading: 'Loading help',
  articleLoading: 'Loading article',
  notFound: 'This article was not found.',
  back: 'Back to help',
  raise: 'Raise a support ticket',
  helpful: 'Helpful',
  notHelpful: 'Not helpful',
  deflectionSent: 'Thanks for the feedback.',
  open: 'Open',
} as const;

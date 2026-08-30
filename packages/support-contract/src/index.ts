export const SUPPORT_SCREENS = [
  'ticket-new',
  'ticket-detail',
  'help',
  'help-article',
] as const;

export type SupportScreen = (typeof SUPPORT_SCREENS)[number];

export type PharmacyRole = 'pharmacy_owner' | 'pharmacy_staff';

export type PlanCode = 'FREE' | 'STARTER' | 'RETAIL_PRO' | 'ENTERPRISE';

/** Core ticket reply row. Extra present keys may render as text. */
export type TicketReply = {
  id?: string | null;
  body?: string | null;
  message?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
};

/** Core EPIC-015 ticket. Extra present keys render via the label map. */
export type SupportTicket = {
  id?: string | null;
  ticket_id?: string | null;
  subject?: string | null;
  description?: string | null;
  status?: string | null;
  category?: string | null;
  customer_id?: string | null;
  replies?: TicketReply[] | null;
  [key: string]: unknown;
};

export type HelpArticleSummary = {
  id?: string | null;
  article_id?: string | null;
  title?: string | null;
  [key: string]: unknown;
};

export type HelpArticle = HelpArticleSummary & {
  body?: string | null;
};

export type SupportCommand =
  | {
      screen: 'ticket-new';
      action: 'create';
      values: { subject: string; description?: string; category?: string };
    }
  | {
      screen: 'ticket-detail';
      action: 'load';
      values: { ticketId: string };
    }
  | {
      screen: 'ticket-detail';
      action: 'reply';
      values: { ticketId: string; body: string };
    }
  | {
      screen: 'ticket-detail';
      action: 'csat';
      values: { ticketId: string; rating: number };
    }
  | {
      screen: 'ticket-detail';
      action: 'reopen';
      values: { ticketId: string; reason: string };
    }
  | { screen: 'help'; action: 'load' }
  | {
      screen: 'help-article';
      action: 'load';
      values: { articleId: string };
    }
  | {
      screen: 'help-article';
      action: 'deflection';
      values: { articleId: string; helpful: boolean };
    };

export type SupportSubmitSuccess = {
  ok: true;
  ticket?: SupportTicket | null;
  ticketId?: string | null;
  articles?: HelpArticleSummary[];
  article?: HelpArticle | null;
};

export type SupportSubmitFailure = {
  ok: false;
  fieldErrors?: Record<string, string>;
  formError?: string;
  code?: string;
};

export type SupportSubmitResult = SupportSubmitSuccess | SupportSubmitFailure;

export type SupportFeatureData = {
  screen: SupportScreen;
  onSubmit: (command: SupportCommand) => Promise<SupportSubmitResult>;
  role?: PharmacyRole | null;
  plan?: PlanCode | null;
  canUseTickets?: boolean;
  authenticated?: boolean;
  ticketId?: string | null;
  articleId?: string | null;
  tokenScope?: 'full' | 'pos' | null;
  userId?: string | null;
  errors?: Record<string, string>;
  formError?: string;
  busy?: boolean;
  disabled?: boolean;
};

export const TICKET_FIELD_LABELS: Record<string, string> = {
  id: 'Ticket',
  ticket_id: 'Ticket',
  subject: 'Subject',
  description: 'Description',
  status: 'Status',
  category: 'Category',
  customer_id: 'Customer',
};

export function isSupportScreen(value: unknown): value is SupportScreen {
  return (
    typeof value === 'string' &&
    (SUPPORT_SCREENS as readonly string[]).includes(value)
  );
}

export function isSupportFeatureData(
  value: unknown,
): value is SupportFeatureData {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const feature = value as Partial<SupportFeatureData>;
  return (
    isSupportScreen(feature.screen) && typeof feature.onSubmit === 'function'
  );
}

export function isTicketNotFound(code: unknown): boolean {
  return code === 'TICKET_NOT_FOUND';
}

export function isHelpArticleNotFound(code: unknown): boolean {
  return code === 'HELP_ARTICLE_NOT_FOUND';
}

export function isForbidden(code: unknown): boolean {
  return code === 'FORBIDDEN' || code === 'INSUFFICIENT_PERMISSIONS';
}

export function isPosTokenRestricted(code: unknown): boolean {
  return code === 'POS_TOKEN_RESTRICTED';
}

export function isSupportUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function ticketIdOf(ticket: SupportTicket | null | undefined): string {
  if (!ticket) {
    return '';
  }
  if (typeof ticket.id === 'string' && ticket.id) {
    return ticket.id;
  }
  if (typeof ticket.ticket_id === 'string' && ticket.ticket_id) {
    return ticket.ticket_id;
  }
  return '';
}

export function articleIdOf(
  article: HelpArticleSummary | null | undefined,
): string {
  if (!article) {
    return '';
  }
  if (typeof article.id === 'string' && article.id) {
    return article.id;
  }
  if (typeof article.article_id === 'string' && article.article_id) {
    return article.article_id;
  }
  return '';
}

export function replyBodyOf(reply: TicketReply): string {
  if (typeof reply.body === 'string' && reply.body) {
    return reply.body;
  }
  if (typeof reply.message === 'string' && reply.message) {
    return reply.message;
  }
  return '';
}

export function isResolvedStatus(status: unknown): boolean {
  if (typeof status !== 'string') {
    return false;
  }
  const key = status.trim().toUpperCase();
  return key === 'RESOLVED' || key === 'CLOSED';
}

export function ticketFieldLabel(key: string): string {
  return TICKET_FIELD_LABELS[key] ?? key.replaceAll('_', ' ');
}

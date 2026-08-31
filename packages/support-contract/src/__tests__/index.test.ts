import { describe, expect, it } from 'vitest';
import {
  SUPPORT_SCREENS,
  articleIdOf,
  isForbidden,
  isHelpArticleNotFound,
  isPosTokenRestricted,
  isResolvedStatus,
  isSupportFeatureData,
  isSupportScreen,
  isSupportUuid,
  isTicketNotFound,
  replyBodyOf,
  ticketFieldLabel,
  ticketIdOf,
} from '../index';

describe('support-contract', () => {
  it('recognises screens and feature payloads', () => {
    expect(SUPPORT_SCREENS).toContain('ticket-new');
    expect(SUPPORT_SCREENS).toContain('ticket-list');
    expect(isSupportScreen('help-article')).toBe(true);
    expect(isSupportScreen('nope')).toBe(false);
    expect(isSupportScreen(1)).toBe(false);
    expect(isSupportFeatureData(null)).toBe(false);
    expect(isSupportFeatureData({})).toBe(false);
    expect(
      isSupportFeatureData({
        screen: 'help',
        onSubmit: async () => ({ ok: true }),
      }),
    ).toBe(true);
  });

  it('maps domain error codes and ticket helpers', () => {
    expect(isTicketNotFound('TICKET_NOT_FOUND')).toBe(true);
    expect(isTicketNotFound('FORBIDDEN')).toBe(false);
    expect(isHelpArticleNotFound('HELP_ARTICLE_NOT_FOUND')).toBe(true);
    expect(isForbidden('FORBIDDEN')).toBe(true);
    expect(isForbidden('INSUFFICIENT_PERMISSIONS')).toBe(true);
    expect(isForbidden('TICKET_NOT_FOUND')).toBe(false);
    expect(isPosTokenRestricted('POS_TOKEN_RESTRICTED')).toBe(true);
    expect(isSupportUuid('3fa85f64-5717-4562-b3fc-2c963f66afa6')).toBe(true);
    expect(isSupportUuid('nope')).toBe(false);
    expect(ticketIdOf({ id: 't-1' })).toBe('t-1');
    expect(ticketIdOf({ ticket_id: 't-2' })).toBe('t-2');
    expect(ticketIdOf({})).toBe('');
    expect(ticketIdOf(null)).toBe('');
    expect(articleIdOf({ article_id: 'a-1' })).toBe('a-1');
    expect(articleIdOf({ id: 'a-2' })).toBe('a-2');
    expect(articleIdOf({})).toBe('');
    expect(articleIdOf(null)).toBe('');
    expect(articleIdOf(undefined)).toBe('');
    expect(replyBodyOf({ message: 'Hi' })).toBe('Hi');
    expect(replyBodyOf({ body: 'Body' })).toBe('Body');
    expect(replyBodyOf({})).toBe('');
    expect(isResolvedStatus('RESOLVED')).toBe(true);
    expect(isResolvedStatus('closed')).toBe(true);
    expect(isResolvedStatus('OPEN')).toBe(false);
    expect(isResolvedStatus(null)).toBe(false);
    expect(ticketFieldLabel('subject')).toBe('Subject');
    expect(ticketFieldLabel('extra_note')).toBe('extra note');
  });
});

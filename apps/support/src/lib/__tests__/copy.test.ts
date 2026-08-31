import { describe, expect, it } from 'vitest';
import {
  HELP_COPY,
  SCREEN_COPY,
  TICKET_COPY,
  dash,
  errorText,
  listOf,
  rootTestId,
} from '../copy';

describe('support copy', () => {
  it('labels screens and helpers', () => {
    expect(SCREEN_COPY['ticket-list'].title).toMatch(/ticket/i);
    expect(SCREEN_COPY['ticket-new'].title).toMatch(/ticket/i);
    expect(SCREEN_COPY['ticket-detail'].title).toMatch(/ticket/i);
    expect(SCREEN_COPY.help.title).toMatch(/help/i);
    expect(rootTestId('ticket-new')).toBe('support-ticket-new-page');
    expect(TICKET_COPY.subjectRequired).toMatch(/subject/i);
    expect(HELP_COPY.notFound).toMatch(/not found/i);
    expect(errorText({ formError: 'Nope' })).toBe('Nope');
    expect(errorText({ code: 'FORBIDDEN' })).toBe('FORBIDDEN');
    expect(errorText({})).toBe('Unable to continue.');
    expect(dash(null)).toBe('—');
    expect(dash('')).toBe('—');
    expect(dash(12)).toBe('12');
    expect(listOf(undefined)).toEqual([]);
    expect(listOf(['a'])).toEqual(['a']);
  });
});

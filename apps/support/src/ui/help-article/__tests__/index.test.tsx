import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ARTICLE_ID,
  HELP_ARTICLE,
  data,
  feature,
} from '../../../app/__tests__/helpers';
import SupportMfe from '../../../app/SupportMfe';

afterEach(() => {
  cleanup();
});

describe('HelpArticleScreen', () => {
  it('renders title and body as text and records deflection', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (command: { action: string }) => {
      if (command.action === 'load') {
        return HELP_ARTICLE;
      }
      return { ok: true as const };
    });
    const onNavigate = vi.fn();
    render(
      <SupportMfe
        data={data(feature('help-article', onSubmit), {
          capabilities: { navigate: onNavigate },
        })}
      />,
    );
    expect(await screen.findByTestId('help-article-body')).toHaveTextContent(
      'Update hours from Settings → Profile.',
    );
    expect(screen.queryByText(/<p>/)).toBeNull();
    await user.click(screen.getByTestId('help-article-helpful'));
    expect(onSubmit).toHaveBeenCalledWith({
      screen: 'help-article',
      action: 'deflection',
      values: { articleId: ARTICLE_ID, helpful: true },
    });
    expect(screen.getByTestId('help-deflection-sent')).toBeTruthy();
    await user.click(screen.getByTestId('help-article-raise'));
    expect(onNavigate).toHaveBeenCalledWith('/support/new');
    await user.click(screen.getByTestId('help-article-back'));
    expect(onNavigate).toHaveBeenCalledWith('/help');
  });

  it('shows not-found with a back link and anonymous ticket return', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <SupportMfe
        data={data(
          feature(
            'help-article',
            async () => ({ ok: false, code: 'HELP_ARTICLE_NOT_FOUND' }),
            { authenticated: false },
          ),
          { capabilities: { navigate: onNavigate } },
        )}
      />,
    );
    expect(await screen.findByTestId('help-article-not-found')).toBeTruthy();
    await user.click(screen.getByTestId('help-article-back'));
    expect(onNavigate).toHaveBeenCalledWith('/help');
    cleanup();
    render(
      <SupportMfe
        data={data(
          feature('help-article', async () => HELP_ARTICLE, {
            authenticated: false,
          }),
          { capabilities: { navigate: onNavigate } },
        )}
      />,
    );
    await user.click(await screen.findByTestId('help-article-raise'));
    expect(onNavigate).toHaveBeenCalledWith('/login?return=/support/new');
    cleanup();
    render(
      <SupportMfe
        data={data(
          feature('help-article', async () => ({ ok: true }), {
            articleId: null,
          }),
        )}
      />,
    );
    expect(await screen.findByTestId('help-article-not-found')).toBeTruthy();
  });

  it('retries article load errors and not-helpful deflection failures', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (command: { action: string }) => {
      if (command.action === 'load') {
        return { ok: false, formError: 'Down' };
      }
      return { ok: false, formError: 'Bad feedback' };
    });
    render(<SupportMfe data={data(feature('help-article', onSubmit))} />);
    expect(await screen.findByTestId('help-article-error')).toHaveTextContent(
      'Down',
    );
    cleanup();
    const deflect = vi.fn(async (command: { action: string }) => {
      if (command.action === 'load') {
        return HELP_ARTICLE;
      }
      return { ok: false, formError: 'Bad feedback' };
    });
    render(<SupportMfe data={data(feature('help-article', deflect))} />);
    await user.click(await screen.findByTestId('help-article-not-helpful'));
    expect(screen.getByTestId('help-article-error')).toHaveTextContent(
      'Bad feedback',
    );
  });
});

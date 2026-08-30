import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ARTICLE_ID,
  HELP_LIST,
  data,
  feature,
} from '../../../app/__tests__/helpers';
import SupportMfe from '../../../app/SupportMfe';

afterEach(() => {
  cleanup();
});

describe('HelpScreen', () => {
  it('renders the catalogue and routes authenticated ticket CTA', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <SupportMfe
        data={data(
          feature('help', async () => HELP_LIST),
          {
            capabilities: { navigate: onNavigate },
          },
        )}
      />,
    );
    expect(await screen.findByTestId('help-catalogue')).toHaveTextContent(
      'Store opening hours',
    );
    expect(screen.queryByRole('search')).toBeNull();
    await user.click(screen.getByTestId(`help-article-${ARTICLE_ID}`));
    expect(onNavigate).toHaveBeenCalledWith(`/help/articles/${ARTICLE_ID}`);
    await user.click(screen.getByTestId('help-raise-ticket'));
    expect(onNavigate).toHaveBeenCalledWith('/support/new');
    cleanup();
    render(
      <SupportMfe
        data={data(
          feature('help', async () => ({
            ok: true,
            articles: [{ title: 'Untitled' }],
          })),
        )}
      />,
    );
    expect(await screen.findByTestId('help-article-0')).toBeDisabled();
  });

  it('sends anonymous ticket CTA to a safe login return', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <SupportMfe
        data={data(
          feature('help', async () => HELP_LIST, { authenticated: false }),
          { capabilities: { navigate: onNavigate } },
        )}
      />,
    );
    await user.click(await screen.findByTestId('help-raise-ticket'));
    expect(onNavigate).toHaveBeenCalledWith('/login?return=/support/new');
  });

  it('shows empty and retries load errors', async () => {
    const user = userEvent.setup();
    render(
      <SupportMfe
        data={data(feature('help', async () => ({ ok: true, articles: [] })))}
      />,
    );
    expect(await screen.findByTestId('help-empty')).toBeTruthy();
    cleanup();
    const onSubmit = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, formError: 'Down' })
      .mockResolvedValue(HELP_LIST);
    render(<SupportMfe data={data(feature('help', onSubmit))} />);
    expect(await screen.findByTestId('help-error')).toHaveTextContent('Down');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByTestId('help-catalogue')).toBeTruthy();
  });
});

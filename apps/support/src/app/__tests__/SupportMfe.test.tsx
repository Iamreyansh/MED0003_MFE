import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import type { SupportScreen } from '@medmate/support-contract';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SupportLayout } from '../../layouts/SupportLayout';
import SupportMfe from '../SupportMfe';
import { HELP_LIST, OPEN_TICKET, data, feature } from './helpers';

afterEach(() => {
  cleanup();
});

describe('SupportMfe', () => {
  it('shows a contract error without a screen', () => {
    render(
      <SupportMfe
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: { title: 'x' } as never,
        }}
      />,
    );
    expect(screen.getByTestId('support-contract-error')).toBeTruthy();
  });
});

describe('SupportLayout', () => {
  it('renders unknown screens', () => {
    render(
      <SupportLayout
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: {
            screen: 'nope' as SupportScreen,
            onSubmit: async () => ({ ok: true }),
          },
        }}
      />,
    );
    expect(screen.getByText('Unknown support screen.')).toBeTruthy();
  });

  it('routes create, detail, and help', async () => {
    const { rerender } = render(
      <SupportMfe data={data(feature('ticket-list'))} />,
    );
    expect(screen.getByTestId('support-ticket-list-page')).toBeTruthy();
    rerender(<SupportMfe data={data(feature('ticket-new'))} />);
    expect(screen.getByTestId('support-ticket-new-page')).toBeTruthy();
    rerender(
      <SupportMfe
        data={data(feature('ticket-detail', async () => OPEN_TICKET))}
      />,
    );
    expect(
      await screen.findByTestId('support-ticket-detail-page'),
    ).toBeTruthy();
    rerender(
      <SupportMfe data={data(feature('help', async () => HELP_LIST))} />,
    );
    expect(await screen.findByTestId('support-help-page')).toBeTruthy();
    rerender(<SupportMfe data={data(feature('help-article'))} />);
    expect(screen.getByTestId('support-help-article-page')).toBeTruthy();
  });
});

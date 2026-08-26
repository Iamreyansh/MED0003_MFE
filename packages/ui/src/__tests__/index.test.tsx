import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Inline, PageSection, Stack, StatusMessage } from '../index';

afterEach(() => {
  cleanup();
});

describe('layout and feedback', () => {
  it('renders stack, wrapping inline, and page section', () => {
    render(
      <PageSection title="Tasks">
        <Stack>
          <Inline wrap>
            <span>One</span>
            <span>Two</span>
          </Inline>
        </Stack>
      </PageSection>,
    );
    expect(screen.getByRole('heading', { name: 'Tasks' })).toBeTruthy();
    expect(screen.getByText('One')).toBeTruthy();
  });

  it('renders page section and inline without optional flags', () => {
    render(
      <PageSection>
        <Inline>
          <span>Plain</span>
        </Inline>
      </PageSection>,
    );
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByText('Plain')).toBeTruthy();
  });

  it('exposes status messages with roles and tones', () => {
    const { rerender } = render(<StatusMessage>Loading todos</StatusMessage>);
    expect(screen.getByRole('status')).toHaveTextContent('Loading todos');
    rerender(<StatusMessage tone="info">Ready</StatusMessage>);
    expect(screen.getByRole('status')).toHaveTextContent('Ready');
    rerender(<StatusMessage tone="error">Failed</StatusMessage>);
    expect(screen.getByRole('status')).toHaveTextContent('Failed');
  });
});

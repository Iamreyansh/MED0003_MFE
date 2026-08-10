import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTodoEnvelope, renderWithProviders } from './index';

afterEach(() => {
  cleanup();
});

describe('test-utils', () => {
  it('creates a todo envelope and renders with providers', () => {
    const onChange = vi.fn();
    const envelope = createTodoEnvelope({
      title: 'Demo',
      onChange,
    });
    expect(envelope.context.hostId).toBe('test-host');
    expect(envelope.feature.title).toBe('Demo');

    renderWithProviders(<div data-testid="wrapped">ok</div>);
    expect(screen.getByTestId('wrapped').textContent).toBe('ok');
  });
});

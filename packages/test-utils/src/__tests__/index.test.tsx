import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createMfeEnvelope, renderWithProviders } from '../index';

afterEach(() => {
  cleanup();
});

describe('test-utils', () => {
  it('creates a generic envelope and renders with providers', () => {
    const envelope = createMfeEnvelope({
      feature: { title: 'Demo' },
      context: { hostId: 'custom-host', permissions: ['x'] },
    });
    expect(envelope.context.hostId).toBe('custom-host');
    expect(envelope.feature.title).toBe('Demo');
    expect(envelope.context.permissions).toEqual(['x']);

    renderWithProviders(<div data-testid="wrapped">ok</div>);
    expect(screen.getByTestId('wrapped').textContent).toBe('ok');
  });

  it('applies defaults when options are omitted', () => {
    const envelope = createMfeEnvelope();
    expect(envelope.context.hostId).toBe('test-host');
    expect(envelope.feature).toEqual({});
    expect(envelope.context.permissions).toEqual([]);

    renderWithProviders(<span data-testid="default">hi</span>, {});
    expect(screen.getByTestId('default').textContent).toBe('hi');
  });
});

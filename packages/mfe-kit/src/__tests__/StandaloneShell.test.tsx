import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { StandaloneShell } from '../StandaloneShell';

afterEach(() => {
  cleanup();
});

describe('StandaloneShell', () => {
  it('renders title, default description, and children', () => {
    render(
      <StandaloneShell title="Demo harness">
        <p>Child</p>
      </StandaloneShell>,
    );
    expect(screen.getByRole('heading', { name: 'Demo harness' })).toBeTruthy();
    expect(
      screen.getByText(
        'Developers can run this package alone before mounting it in a host.',
      ),
    ).toBeTruthy();
    expect(screen.getByText('Child')).toBeTruthy();
  });

  it('accepts a custom description', () => {
    render(
      <StandaloneShell title="Custom" description="Local only">
        <span>Body</span>
      </StandaloneShell>,
    );
    expect(screen.getByText('Local only')).toBeTruthy();
  });
});

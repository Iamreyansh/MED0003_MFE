import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Spinner } from '../Spinner';

afterEach(() => {
  cleanup();
});

describe('Spinner', () => {
  it('exposes a status with the default loading label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeTruthy();
  });

  it('covers sizes, block layout, and a custom label', () => {
    const { rerender } = render(<Spinner size="sm" label="Fetching" />);
    expect(screen.getByRole('status', { name: 'Fetching' })).toBeTruthy();

    rerender(<Spinner size="lg" block />);
    expect(screen.getByRole('status', { name: 'Loading' })).toHaveClass(
      'min-h-48',
    );

    rerender(<Spinner size="md" className="text-mm-muted" />);
    expect(screen.getByRole('status')).toHaveClass('text-mm-muted');
  });
});

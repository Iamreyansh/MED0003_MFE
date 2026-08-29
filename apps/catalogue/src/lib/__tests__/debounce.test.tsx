import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDebouncedValue } from '../debounce';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function Probe({ value }: { value: string }) {
  const debounced = useDebouncedValue(value, 300);
  return <span data-testid="value">{debounced}</span>;
}

describe('useDebouncedValue', () => {
  it('delays updates and cancels the pending timer on unmount', () => {
    vi.useFakeTimers();
    const { rerender, unmount } = render(<Probe value="a" />);
    expect(screen.getByTestId('value')).toHaveTextContent('a');
    rerender(<Probe value="ab" />);
    expect(screen.getByTestId('value')).toHaveTextContent('a');
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByTestId('value')).toHaveTextContent('ab');
    rerender(<Probe value="abc" />);
    unmount();
    act(() => {
      vi.advanceTimersByTime(300);
    });
  });
});

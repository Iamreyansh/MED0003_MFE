import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { Box } from '../../elements/Box';
import { cn } from '../cn';

afterEach(() => {
  cleanup();
});

describe('cn', () => {
  it('merges conflicting tailwind classes', () => {
    const skip = false;
    expect(cn('px-2', 'px-4', skip && 'hidden', undefined)).toBe('px-4');
  });
});

describe('Box', () => {
  it('renders a div by default and forwards a ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Box ref={ref} className="p-2">
        Body
      </Box>,
    );
    expect(screen.getByText('Body').tagName).toBe('DIV');
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders a custom element through as', () => {
    render(
      <Box as="section" aria-label="Panel">
        Nested
      </Box>,
    );
    expect(screen.getByLabelText('Panel').tagName).toBe('SECTION');
  });

  it('merges onto a child with asChild', () => {
    render(
      <Box asChild className="font-mm" data-testid="slotted">
        <article>Slotted</article>
      </Box>,
    );
    expect(screen.getByTestId('slotted').tagName).toBe('ARTICLE');
  });
});

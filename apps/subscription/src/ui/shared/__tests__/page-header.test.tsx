import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PageHeader } from '../page-header';

afterEach(() => {
  cleanup();
});

describe('PageHeader', () => {
  it('renders an optional badge', () => {
    render(<PageHeader title="Plans" helper="Help" badge="Trial" />);
    expect(screen.getByText('Trial')).toBeTruthy();
  });

  it('renders a kicker above the title', () => {
    render(<PageHeader title="Plans" helper="Help" kicker="Plan index" />);
    expect(screen.getByText('Plan index')).toBeTruthy();
  });
});

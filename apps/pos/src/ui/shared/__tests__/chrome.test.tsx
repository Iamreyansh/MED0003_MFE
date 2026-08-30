import { cleanup, render, screen } from '@testing-library/react';
import { Package } from 'lucide-react';
import { afterEach, describe, expect, it } from 'vitest';
import { EmptyState } from '../empty-state';
import { FormBanner } from '../form-error';
import { IconTile } from '../icon-tile';
import { PageHeader } from '../page-header';
import { Rule } from '../rule';
import { SectionBlock } from '../section-block';

afterEach(() => {
  cleanup();
});

describe('pos chrome', () => {
  it('renders header, banner, empty, and section chrome', () => {
    const { container } = render(<Rule />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
    render(<PageHeader title="POS" helper="Take payment" kicker="Counter" />);
    expect(screen.getByText('Take payment')).toBeTruthy();
    render(<PageHeader title="Bare" helper="No kicker" />);
    expect(screen.getByRole('heading', { name: 'Bare' })).toBeTruthy();
    const { container: emptyBanner } = render(<FormBanner />);
    expect(emptyBanner).toBeEmptyDOMElement();
    render(<FormBanner message="Failed" testId="banner" />);
    expect(screen.getByTestId('banner')).toHaveTextContent('Failed');
    render(<IconTile icon={Package} />);
    render(<IconTile icon={Package} tone="muted" />);
    render(
      <SectionBlock id="section-cart" title="Cart" hint="Lines" icon={Package}>
        inner
      </SectionBlock>,
    );
    expect(screen.getByRole('heading', { name: 'Cart' })).toBeTruthy();
    render(
      <SectionBlock
        id="section-bare"
        title="Bare"
        hint="No icon"
        footer={<button type="button">Save</button>}
      >
        inner
      </SectionBlock>,
    );
    expect(
      screen.getAllByRole('heading', { name: 'Bare' }).length,
    ).toBeGreaterThan(0);
    render(
      <SectionBlock
        id="section-compact"
        title="Compact"
        hint="Dense ticket"
        icon={Package}
        density="compact"
        headerEnd={<span>2</span>}
        footer={<button type="button">Done</button>}
      >
        dense
      </SectionBlock>,
    );
    expect(screen.getByRole('heading', { name: 'Compact' })).toBeTruthy();
    expect(screen.getByText('Dense ticket')).toBeTruthy();
    render(
      <EmptyState icon={Package} testId="pos-empty-node">
        <span>Node empty</span>
      </EmptyState>,
    );
    expect(screen.getByTestId('pos-empty-node')).toHaveTextContent(
      'Node empty',
    );
    render(
      <EmptyState icon={Package} testId="pos-empty">
        Empty cart
      </EmptyState>,
    );
    expect(screen.getByTestId('pos-empty')).toHaveTextContent('Empty cart');
  });
});

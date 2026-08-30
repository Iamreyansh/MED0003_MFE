import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Circle, Landmark } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmptyState } from '../empty-state';
import { FormBanner } from '../form-error';
import { IconTile } from '../icon-tile';
import { PageHeader } from '../page-header';
import { Pager } from '../pager';
import { Rule } from '../rule';
import { SectionBlock, TableShell } from '../section-block';
import { StatusBadge } from '../status-badge';

afterEach(() => {
  cleanup();
});

describe('finance chrome', () => {
  it('renders header, pager, badges, and empty states', async () => {
    const user = userEvent.setup();
    const { container } = render(<Rule />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
    render(
      <PageHeader title="Settlements" helper="Payouts" kicker="Finance" />,
    );
    expect(screen.getByText('Finance')).toBeTruthy();
    render(<PageHeader title="Settlement" helper="Detail" />);
    expect(screen.getByRole('heading', { name: 'Settlement' })).toBeTruthy();
    const { container: hiddenPager } = render(
      <Pager
        page={1}
        hasNext={false}
        previousLabel="Previous"
        nextLabel="Next"
        pageLabel="Page"
        onPage={vi.fn()}
      />,
    );
    expect(hiddenPager).toBeEmptyDOMElement();
    const { container: emptyBanner } = render(<FormBanner />);
    expect(emptyBanner).toBeEmptyDOMElement();
    render(<FormBanner message="Failed" testId="banner" />);
    expect(screen.getByTestId('banner')).toHaveTextContent('Failed');
    const onPage = vi.fn();
    render(
      <Pager
        page={2}
        hasNext
        previousLabel="Previous"
        nextLabel="Next"
        pageLabel="Page"
        onPage={onPage}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(onPage).toHaveBeenCalledWith(1);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPage).toHaveBeenCalledWith(3);
    render(
      <>
        <IconTile icon={Circle} />
        <IconTile icon={Circle} tone="muted" />
        <IconTile icon={Circle} tone="danger" />
        <IconTile icon={Circle} tone="contrast" size="lg" />
        <StatusBadge status="RELEASED" />
        <StatusBadge status="HELD" />
        <StatusBadge status="FAILED" />
        <StatusBadge status="PENDING" />
        <StatusBadge status={null} />
      </>,
    );
    expect(screen.getByText('RELEASED')).toBeTruthy();
    render(
      <SectionBlock
        id="section-settlements"
        title="History"
        hint="Weekly"
        icon={Landmark}
        footer={<button type="button">Retry</button>}
      >
        inner
      </SectionBlock>,
    );
    expect(screen.getByRole('heading', { name: 'History' })).toBeTruthy();
    render(<TableShell id="section-table">rows</TableShell>);
    expect(screen.getByText('rows')).toBeTruthy();
    render(
      <EmptyState icon={Landmark} testId="finance-empty">
        No payouts
      </EmptyState>,
    );
    expect(screen.getByTestId('finance-empty')).toHaveTextContent('No payouts');
    render(
      <EmptyState
        icon={Landmark}
        testId="custom-empty"
        actions={<span>Add</span>}
      >
        <p>Custom</p>
      </EmptyState>,
    );
    expect(screen.getByTestId('custom-empty')).toHaveTextContent('Custom');
    render(
      <SectionBlock id="section-bare" title="Bare">
        inner
      </SectionBlock>,
    );
    expect(screen.getByRole('heading', { name: 'Bare' })).toBeTruthy();
  });
});

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Circle, Package } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmptyState } from '../empty-state';
import { FormBanner } from '../form-error';
import { IconTile } from '../icon-tile';
import { PageHeader } from '../page-header';
import { Pager } from '../pager';
import { PlanLock } from '../plan-lock';
import { Rule } from '../rule';
import { SectionBlock } from '../section-block';

afterEach(() => {
  cleanup();
});

describe('procurement chrome', () => {
  it('renders a decorative rule and optional kicker', () => {
    const { container } = render(<Rule />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
    render(<PageHeader title="Purchases" helper="GRN" kicker="Stock in" />);
    expect(screen.getByText('Stock in')).toBeTruthy();
    render(<PageHeader title="Reorder" helper="PO" />);
    expect(screen.getByRole('heading', { name: 'Reorder' })).toBeTruthy();
  });

  it('skips empty banners and hidden pagers', () => {
    const { container } = render(<FormBanner />);
    expect(container).toBeEmptyDOMElement();
    render(<FormBanner message="Failed" testId="banner" />);
    expect(screen.getByTestId('banner')).toHaveTextContent('Failed');
    const { container: pager } = render(
      <Pager
        page={1}
        hasNext={false}
        previousLabel="Previous"
        nextLabel="Next"
        pageLabel="Page"
        onPage={vi.fn()}
      />,
    );
    expect(pager).toBeEmptyDOMElement();
  });

  it('pages and renders lock, tiles, and empty state', async () => {
    const user = userEvent.setup();
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
      </>,
    );
    expect(screen.getAllByRole('generic').length).toBeGreaterThan(0);

    render(
      <SectionBlock
        id="section-stock"
        title="Receipts"
        hint="GRNs"
        icon={Package}
        footer={<button type="button">Save</button>}
      >
        inner
      </SectionBlock>,
    );
    expect(screen.getByRole('heading', { name: 'Receipts' })).toBeTruthy();
    render(
      <SectionBlock id="section-bare" title="Bare" hint="No icon">
        inner
      </SectionBlock>,
    );
    expect(screen.getByRole('heading', { name: 'Bare' })).toBeTruthy();

    render(
      <EmptyState icon={Package} testId="purchases-empty">
        No receipts yet
      </EmptyState>,
    );
    expect(screen.getByTestId('purchases-empty')).toHaveTextContent(
      'No receipts yet',
    );
    render(
      <EmptyState
        icon={Package}
        testId="custom-empty"
        actions={<button type="button">Add</button>}
      >
        <p>Custom</p>
      </EmptyState>,
    );
    expect(screen.getByTestId('custom-empty')).toHaveTextContent('Custom');

    const onView = vi.fn();
    render(
      <PlanLock
        testId="distributors-plan-lock"
        message="Distributor directory is available on Growth."
        viewPlansLabel="View plans"
        onViewPlans={onView}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'View plans' }));
    expect(onView).toHaveBeenCalled();
    render(
      <PlanLock
        testId="reorder-plan-lock"
        message="Locked"
        viewPlansLabel="View plans"
        isStaff
      />,
    );
    expect(
      screen.queryAllByRole('button', { name: 'View plans' }),
    ).toHaveLength(1);
  });
});

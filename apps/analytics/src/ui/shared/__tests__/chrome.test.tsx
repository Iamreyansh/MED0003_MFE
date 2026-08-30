import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Circle, BarChart3 } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmptyState } from '../empty-state';
import { FilterField, FilterToolbar } from '../filter-toolbar';
import { FormBanner } from '../form-error';
import { IconTile } from '../icon-tile';
import { PageHeader } from '../page-header';
import { Pager } from '../pager';
import { PeriodToolbar } from '../period-toolbar';
import { PlanLock } from '../plan-lock';
import { Rule } from '../rule';
import { SectionBlock, TableShell } from '../section-block';
import { SelectField } from '../select-field';
import { StatusBadge } from '../status-badge';

afterEach(() => {
  cleanup();
});

describe('analytics chrome', () => {
  it('renders header, lock, pager, and period toolbar', async () => {
    const user = userEvent.setup();
    const { container } = render(<Rule />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
    render(<PageHeader title="Analytics" helper="Growth" kicker="Reports" />);
    expect(screen.getByText('Reports')).toBeTruthy();
    render(<PageHeader title="Overview" helper="Cards" />);
    expect(screen.getByRole('heading', { name: 'Overview' })).toBeTruthy();
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
        id="section-analytics"
        title="Totals"
        hint="Period"
        icon={BarChart3}
        footer={<button type="button">Retry</button>}
      >
        inner
      </SectionBlock>,
    );
    expect(screen.getByRole('heading', { name: 'Totals' })).toBeTruthy();
    render(<TableShell id="section-table">rows</TableShell>);
    expect(screen.getByText('rows')).toBeTruthy();
    render(
      <FilterToolbar actions={<button type="button">Go</button>}>
        <FilterField>
          <span>bare-filter</span>
        </FilterField>
        <FilterField grow>
          <span>wide</span>
        </FilterField>
      </FilterToolbar>,
    );
    expect(screen.getByText('wide')).toBeTruthy();
    render(
      <EmptyState icon={BarChart3} testId="analytics-empty">
        No metrics
      </EmptyState>,
    );
    expect(screen.getByTestId('analytics-empty')).toHaveTextContent(
      'No metrics',
    );
    render(
      <EmptyState
        icon={BarChart3}
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
    const onView = vi.fn();
    render(
      <PlanLock
        testId="analytics-lock"
        message="Locked"
        viewPlansLabel="View plans"
        onViewPlans={onView}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'View plans' }));
    expect(onView).toHaveBeenCalled();
    render(
      <PlanLock
        testId="staff-lock"
        message="Locked"
        viewPlansLabel="View plans"
        isStaff
      />,
    );
    expect(
      screen.queryAllByRole('button', { name: 'View plans' }),
    ).toHaveLength(1);
    const onPeriod = vi.fn();
    const onApply = vi.fn();
    render(
      <PeriodToolbar
        period="30D"
        dateFrom=""
        dateTo=""
        onPeriod={onPeriod}
        onDateFrom={vi.fn()}
        onDateTo={vi.fn()}
        onApplyCustom={onApply}
      />,
    );
    await user.selectOptions(screen.getByLabelText('Period'), 'FY');
    expect(onPeriod).toHaveBeenCalledWith('FY');
    cleanup();
    render(
      <PeriodToolbar
        period="CUSTOM"
        dateFrom="2026-08-01"
        dateTo="2026-08-30"
        onPeriod={vi.fn()}
        onDateFrom={vi.fn()}
        onDateTo={vi.fn()}
        onApplyCustom={onApply}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Apply dates' }));
    expect(onApply).toHaveBeenCalled();
    const onFrom = vi.fn();
    const onTo = vi.fn();
    cleanup();
    render(
      <PeriodToolbar
        period="CUSTOM"
        dateFrom=""
        dateTo=""
        onPeriod={vi.fn()}
        onDateFrom={onFrom}
        onDateTo={onTo}
        onApplyCustom={vi.fn()}
      />,
    );
    await user.type(screen.getByLabelText('From'), '2026-08-01');
    await user.type(screen.getByLabelText('To'), '2026-08-02');
    expect(onFrom).toHaveBeenCalled();
    expect(onTo).toHaveBeenCalled();
    render(
      <SelectField label="Status" name="status" error="Bad">
        <option value="ONLINE">ONLINE</option>
      </SelectField>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Bad');
    render(<SelectField label="Channel" />);
    expect(screen.getByLabelText('Channel')).toBeTruthy();
  });
});

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Circle, Package } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmptyState } from '../empty-state';
import { FilterField, FilterToolbar } from '../filter-toolbar';
import { FormBanner } from '../form-error';
import { IconTile } from '../icon-tile';
import { PageHeader } from '../page-header';
import { Pager } from '../pager';
import { PlanLock } from '../plan-lock';
import { Rule } from '../rule';
import { SectionBlock, TableShell } from '../section-block';
import { SelectField } from '../select-field';
import { StatusBadge } from '../status-badge';
import { TextareaField } from '../textarea-field';

afterEach(() => {
  cleanup();
});

describe('rx chrome', () => {
  it('renders header, lock, pager, and badges', async () => {
    const user = userEvent.setup();
    const { container } = render(<Rule />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
    render(
      <PageHeader title="Prescriptions" helper="Queue" kicker="Fulfilment" />,
    );
    expect(screen.getByText('Fulfilment')).toBeTruthy();
    render(<PageHeader title="Drug register" helper="H1/X" />);
    expect(screen.getByRole('heading', { name: 'Drug register' })).toBeTruthy();
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
    render(
      <>
        <IconTile icon={Circle} />
        <IconTile icon={Circle} tone="muted" />
        <IconTile icon={Circle} tone="danger" />
        <IconTile icon={Circle} tone="contrast" size="lg" />
        <StatusBadge status="APPROVED" />
        <StatusBadge status="PENDING_REVIEW" />
        <StatusBadge status="REJECTED" />
        <StatusBadge status="" />
      </>,
    );
    expect(screen.getByText('APPROVED')).toBeTruthy();
    render(
      <SectionBlock
        id="section-rx"
        title="Queue"
        hint="Pending"
        icon={Package}
        footer={<button type="button">Retry</button>}
      >
        inner
      </SectionBlock>,
    );
    expect(screen.getByRole('heading', { name: 'Queue' })).toBeTruthy();
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
      <EmptyState icon={Package} testId="rx-empty">
        No prescriptions
      </EmptyState>,
    );
    expect(screen.getByTestId('rx-empty')).toHaveTextContent(
      'No prescriptions',
    );
    render(
      <EmptyState
        icon={Package}
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
        testId="rx-lock"
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
    cleanup();
    render(
      <SelectField label="Status" name="status" error="Bad">
        <option value="APPROVED">APPROVED</option>
      </SelectField>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Bad');
    render(<TextareaField label="Reason" name="reason" error="Required" />);
    expect(screen.getAllByRole('alert').at(-1)).toHaveTextContent('Required');
    render(<SelectField label="Channel" />);
    render(<TextareaField label="Footer" />);
    expect(screen.getByLabelText('Channel')).toBeTruthy();
  });
});

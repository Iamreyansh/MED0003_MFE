import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Circle, Package } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CheckboxField } from '../checkbox-field';
import { DirtyLeaveGuard } from '../dirty-leave';
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

describe('billing chrome', () => {
  it('renders a decorative rule and optional kicker', () => {
    const { container } = render(<Rule />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
    render(<PageHeader title="Invoices" helper="GST" kicker="Money" />);
    expect(screen.getByText('Money')).toBeTruthy();
    render(<PageHeader title="Sales ledger" helper="Day close" />);
    expect(screen.getByRole('heading', { name: 'Sales ledger' })).toBeTruthy();
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

  it('pages and renders lock, tiles, fields, and empty state', async () => {
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
        id="section-invoices"
        title="Invoices"
        hint="GST"
        icon={Package}
        footer={<button type="button">Save</button>}
      >
        inner
      </SectionBlock>,
    );
    expect(screen.getByRole('heading', { name: 'Invoices' })).toBeTruthy();
    render(
      <SectionBlock id="section-bare" title="Bare">
        inner
      </SectionBlock>,
    );
    expect(screen.getByRole('heading', { name: 'Bare' })).toBeTruthy();
    render(<TableShell id="section-table">rows</TableShell>);
    expect(screen.getByText('rows')).toBeTruthy();
    render(
      <FilterToolbar>
        <FilterField>
          <span>bare-filter</span>
        </FilterField>
      </FilterToolbar>,
    );
    expect(screen.getByText('bare-filter')).toBeTruthy();
    render(
      <FilterToolbar actions={<button type="button">Go</button>}>
        <FilterField>
          <label htmlFor="q">Search</label>
          <input id="q" />
        </FilterField>
        <FilterField grow>
          <span>wide</span>
        </FilterField>
      </FilterToolbar>,
    );
    expect(screen.getByText('wide')).toBeTruthy();
    render(
      <>
        <StatusBadge status="PAID" />
        <StatusBadge status="PENDING" />
        <StatusBadge status="PARTIAL" />
        <StatusBadge status="" />
      </>,
    );
    expect(screen.getByText('PAID')).toBeTruthy();
    expect(screen.getByText('PENDING')).toBeTruthy();
    expect(screen.getByText('PARTIAL')).toBeTruthy();

    render(
      <EmptyState icon={Package} testId="invoices-empty">
        No invoices yet
      </EmptyState>,
    );
    expect(screen.getByTestId('invoices-empty')).toHaveTextContent(
      'No invoices yet',
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
        testId="invoice-settings-plan-lock"
        message="Billing is not included in the current plan."
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

    const onCheck = vi.fn();
    render(
      <CheckboxField
        id="show_hsn"
        name="show_hsn"
        label="Show HSN"
        checked={false}
        onChange={onCheck}
      />,
    );
    await user.click(screen.getByLabelText('Show HSN'));
    expect(onCheck).toHaveBeenCalledWith(true);

    render(
      <SelectField label="Template" name="template" error="Bad">
        <option value="MODERN">MODERN</option>
      </SelectField>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Bad');
    render(<TextareaField label="Terms" name="terms" error="Required" />);
    expect(screen.getAllByRole('alert').at(-1)).toHaveTextContent('Required');
  });

  it('confirms dirty leave for internal links and ignores others', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <>
        <DirtyLeaveGuard dirty onNavigate={onNavigate} />
        <a href="/pos">POS</a>
        <a href="#top">Top</a>
        <a href="mailto:a@b.c">Mail</a>
      </>,
    );
    await user.click(screen.getByRole('link', { name: 'POS' }));
    expect(
      screen.getByRole('heading', { name: 'Leave without saving?' }),
    ).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Stay' }));
    expect(onNavigate).not.toHaveBeenCalled();
    await user.click(screen.getByRole('link', { name: 'POS' }));
    await user.click(screen.getByRole('button', { name: 'Leave' }));
    expect(onNavigate).toHaveBeenCalledWith('/pos');
    await user.click(screen.getByRole('link', { name: 'Top' }));
    window.dispatchEvent(new Event('beforeunload'));
    render(<DirtyLeaveGuard dirty={false} />);
  });

  it('ignores same-path, invalid, and non-element dirty clicks', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const here = window.location.pathname || '/';
    render(
      <>
        <DirtyLeaveGuard dirty onNavigate={onNavigate} />
        <a href={here}>Here</a>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid -- empty href covers the guard */}
        <a href="">Empty</a>
        <a href="http://[">Broken</a>
        <button type="button">Plain</button>
      </>,
    );
    await user.click(screen.getByRole('link', { name: 'Here' }));
    expect(
      screen.queryByRole('heading', { name: 'Leave without saving?' }),
    ).toBeNull();
    await user.click(screen.getByRole('link', { name: 'Broken' }));
    await user.click(screen.getByRole('button', { name: 'Plain' }));
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  it('closes the leave dialog from the overlay and uses field id fallbacks', async () => {
    const user = userEvent.setup();
    render(
      <>
        <DirtyLeaveGuard dirty />
        <a href="/sales">Sales</a>
        <SelectField label="Channel">
          <option value="SMS">SMS</option>
        </SelectField>
        <TextareaField label="Footer" />
      </>,
    );
    await user.click(screen.getByRole('link', { name: 'Sales' }));
    expect(
      screen.getByRole('heading', { name: 'Leave without saving?' }),
    ).toBeTruthy();
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: 'Leave without saving?' }),
      ).toBeNull();
    });
    expect(screen.getByLabelText('Channel')).toBeTruthy();
    expect(screen.getByLabelText('Footer')).toBeTruthy();
  });
});

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Circle, Package } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmptyState } from '../empty-state';
import { FilterField, FilterToolbar } from '../filter-toolbar';
import { FormBanner } from '../form-error';
import { IconTile } from '../icon-tile';
import { InputField } from '../input-field';
import { PageHeader } from '../page-header';
import { Pager } from '../pager';
import { Rule } from '../rule';
import { SectionBlock, TableShell } from '../section-block';
import { SelectField } from '../select-field';
import { StatusBadge } from '../status-badge';
import { TextareaField } from '../textarea-field';

afterEach(() => {
  cleanup();
});

describe('orders chrome', () => {
  it('renders header, pager, badges, and fields', async () => {
    const user = userEvent.setup();
    const { container } = render(<Rule />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
    render(<PageHeader title="Rx quotes" helper="Bid" kicker="Fulfilment" />);
    expect(screen.getByText('Fulfilment')).toBeTruthy();
    render(<PageHeader title="Orders" helper="Guidance" />);
    expect(screen.getByRole('heading', { name: 'Orders' })).toBeTruthy();
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
        <StatusBadge status="QUOTED" />
        <StatusBadge status="ACCEPTED" />
        <StatusBadge status="PACKED" />
        <StatusBadge status="EXPIRED" />
        <StatusBadge status="REJECTED" />
        <StatusBadge status="OUT_OF_STOCK" />
        <StatusBadge status="NOTIFIED" />
        <StatusBadge status="PACKING" />
        <StatusBadge status={null} />
        <StatusBadge status="" />
      </>,
    );
    expect(screen.getByText('QUOTED')).toBeTruthy();
    render(
      <SectionBlock
        id="section-quotes"
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
      <EmptyState icon={Package} testId="orders-empty">
        No quotes
      </EmptyState>,
    );
    expect(screen.getByTestId('orders-empty')).toHaveTextContent('No quotes');
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
    render(
      <SelectField label="Status" name="status" error="Bad">
        <option value="QUOTED">QUOTED</option>
      </SelectField>,
    );
    expect(screen.getAllByRole('alert').at(-1)).toHaveTextContent('Bad');
    render(<TextareaField label="Reason" name="reason" error="Required" />);
    expect(screen.getAllByRole('alert').at(-1)).toHaveTextContent('Required');
    render(<InputField label="Rider id" name="rider_id" error="UUID" />);
    expect(screen.getAllByRole('alert').at(-1)).toHaveTextContent('UUID');
    render(<SelectField label="Channel" />);
    render(<TextareaField label="Footer" />);
    render(<InputField label="Price" />);
    expect(screen.getByLabelText('Channel')).toBeTruthy();
  });
});

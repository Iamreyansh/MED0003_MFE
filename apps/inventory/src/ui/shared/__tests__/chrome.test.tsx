import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Circle, Package } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CheckboxField } from '../checkbox-field';
import { EmptyState } from '../empty-state';
import { FormBanner } from '../form-error';
import { IconTile } from '../icon-tile';
import { PageHeader } from '../page-header';
import { Pager } from '../pager';
import { RackChip } from '../rack-chip';
import { Rule } from '../rule';
import { SectionBlock } from '../section-block';
import { SelectField } from '../select-field';

afterEach(() => {
  cleanup();
});

describe('inventory chrome', () => {
  it('renders a decorative rule and optional kicker', () => {
    const { container } = render(<Rule />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
    render(<PageHeader title="Inventory" helper="Stock" kicker="Master" />);
    expect(screen.getByText('Master')).toBeTruthy();
    render(<PageHeader title="Racks" helper="Shelves" />);
    expect(screen.getByRole('heading', { name: 'Racks' })).toBeTruthy();
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

  it('pages and toggles a named switch', async () => {
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
    const onChange = vi.fn();
    render(
      <CheckboxField
        id="online"
        name="is_online_visible"
        label="List on online storefront"
        checked
        onChange={onChange}
      />,
    );
    await user.click(screen.getByLabelText('List on online storefront'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('renders icon tiles, section chrome, empty state, and select errors', () => {
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
        title="Stock on hand"
        hint="Quantities"
        icon={Package}
        footer={<button type="button">Save</button>}
      >
        inner
      </SectionBlock>,
    );
    expect(screen.getByRole('heading', { name: 'Stock on hand' })).toBeTruthy();
    render(
      <SectionBlock id="section-bare" title="Bare" hint="No icon">
        inner
      </SectionBlock>,
    );
    expect(screen.getByRole('heading', { name: 'Bare' })).toBeTruthy();

    render(
      <EmptyState icon={Package} testId="inventory-empty">
        No stock yet
      </EmptyState>,
    );
    expect(screen.getByTestId('inventory-empty')).toHaveTextContent(
      'No stock yet',
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

    render(<RackChip code="A1" />);
    expect(screen.getByText('A1')).toBeTruthy();
    render(<RackChip />);
    expect(screen.getByText('—')).toBeTruthy();
    render(<RackChip emptyLabel="No rack" />);
    expect(screen.getByText('No rack')).toBeTruthy();

    render(
      <SelectField label="Channel" name="channel" error="Required">
        <option value="PHONE">Phone</option>
      </SelectField>,
    );
    expect(screen.getByRole('alert')).toBeTruthy();
    render(
      <SelectField label="Bare">
        <option value="x">x</option>
      </SelectField>,
    );
    expect(screen.getByLabelText('Bare')).toBeTruthy();
  });
});

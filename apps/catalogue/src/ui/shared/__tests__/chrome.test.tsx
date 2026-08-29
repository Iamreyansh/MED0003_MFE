import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CheckboxField } from '../checkbox-field';
import { FormBanner } from '../form-error';
import { PageHeader } from '../page-header';
import { Pager } from '../pager';
import { Rule } from '../rule';

afterEach(() => {
  cleanup();
});

describe('catalogue chrome', () => {
  it('renders a decorative rule and optional kicker', () => {
    const { container } = render(<Rule />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
    render(
      <PageHeader title="Catalogue search" helper="Find SKUs" kicker="Index" />,
    );
    expect(screen.getByText('Index')).toBeTruthy();
    render(<PageHeader title="Mappings" helper="Bind prices" />);
    expect(screen.getByRole('heading', { name: 'Mappings' })).toBeTruthy();
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

  it('pages and toggles a labelled checkbox', async () => {
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
        id="vis"
        name="is_visible"
        label="Visible"
        checked
        onChange={onChange}
      />,
    );
    await user.click(screen.getByLabelText('Visible'));
    expect(onChange).toHaveBeenCalledWith(false);
    cleanup();
    render(
      <CheckboxField
        id="vis-off"
        name="is_visible"
        label="Hidden"
        checked={false}
        disabled
        onChange={onChange}
      />,
    );
    expect(screen.getByLabelText('Hidden')).toBeDisabled();
  });
});

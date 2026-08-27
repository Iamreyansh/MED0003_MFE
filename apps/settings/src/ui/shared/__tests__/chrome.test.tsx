import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Store } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DirtyLeaveGuard } from '../dirty-leave';
import { FormBanner, SaveNote } from '../form-error';
import { PageHeader } from '../page-header';
import { SectionBlock } from '../section-block';
import { SelectField } from '../select-field';

afterEach(() => {
  cleanup();
});

describe('settings shared chrome', () => {
  it('skips an empty form banner', () => {
    const { container } = render(<FormBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a labelled section', () => {
    render(
      <SectionBlock
        id="section-tax"
        title="Tax"
        hint="GSTIN"
        icon={Store}
        footer={<button type="button">Save tax details</button>}
      >
        inner
      </SectionBlock>,
    );
    expect(screen.getByRole('heading', { name: 'Tax' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Save tax details' }),
    ).toBeTruthy();
  });

  it('renders a section without an icon or footer', () => {
    render(
      <SectionBlock id="section-bare" title="Bare" hint="No icon">
        inner
      </SectionBlock>,
    );
    expect(screen.getByRole('heading', { name: 'Bare' })).toBeTruthy();
  });

  it('renders a page header badge and skips empty save notes', () => {
    render(
      <PageHeader
        title="Pharmacy profile"
        helper="Keep details current."
        badge="Active"
      />,
    );
    expect(screen.getByText('Active')).toBeTruthy();
    render(<PageHeader title="Storefront" helper="Pause demand." />);
    const { container } = render(<SaveNote />);
    expect(container).toBeEmptyDOMElement();
    render(<SaveNote message="Profile saved" />);
    expect(screen.getByText('Profile saved')).toBeTruthy();
  });

  it('shows select field errors', () => {
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
  });

  it('ignores non-internal dirty clicks and beforeunload', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<DirtyLeaveGuard dirty onNavigate={onNavigate} />);
    const clickWithoutNav = async (node: HTMLElement) => {
      node.addEventListener('click', (event) => event.preventDefault());
      await user.click(node);
    };
    const empty = document.createElement('a');
    empty.setAttribute('href', '');
    document.body.appendChild(empty);
    await clickWithoutNav(empty);
    empty.remove();
    const mail = document.createElement('a');
    mail.setAttribute('href', 'mailto:a@b.c');
    document.body.appendChild(mail);
    await clickWithoutNav(mail);
    const hash = document.createElement('a');
    hash.setAttribute('href', '#section-tax');
    document.body.appendChild(hash);
    await clickWithoutNav(hash);
    const same = document.createElement('a');
    same.setAttribute('href', window.location.pathname);
    document.body.appendChild(same);
    await clickWithoutNav(same);
    const invalid = document.createElement('a');
    invalid.setAttribute('href', 'http://[');
    document.body.appendChild(invalid);
    await clickWithoutNav(invalid);
    const span = document.createElement('span');
    document.body.appendChild(span);
    await user.click(span);
    window.dispatchEvent(new Event('beforeunload'));
    fireEvent(
      document,
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    expect(onNavigate).not.toHaveBeenCalled();
    mail.remove();
    hash.remove();
    same.remove();
    invalid.remove();
    span.remove();
  });

  it('does not capture clicks when clean', async () => {
    const user = userEvent.setup();
    render(<DirtyLeaveGuard dirty={false} />);
    const link = document.createElement('a');
    link.setAttribute('href', '/elsewhere');
    link.addEventListener('click', (event) => event.preventDefault());
    document.body.appendChild(link);
    await user.click(link);
    expect(
      screen.queryByRole('heading', { name: 'Leave without saving?' }),
    ).toBeNull();
    link.remove();
  });
});

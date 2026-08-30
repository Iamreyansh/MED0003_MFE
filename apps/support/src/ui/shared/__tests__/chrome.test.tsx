import { cleanup, render, screen } from '@testing-library/react';
import { Circle, LifeBuoy } from 'lucide-react';
import { afterEach, describe, expect, it } from 'vitest';
import { EmptyState } from '../empty-state';
import { FormBanner } from '../form-error';
import { IconTile } from '../icon-tile';
import { InputField } from '../input-field';
import { PageHeader } from '../page-header';
import { Rule } from '../rule';
import { SectionBlock } from '../section-block';
import { StatusBadge } from '../status-badge';
import { TextareaField } from '../textarea-field';

afterEach(() => {
  cleanup();
});

describe('support chrome', () => {
  it('renders header, badges, fields, and empty states', () => {
    const { container } = render(<Rule />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
    render(<PageHeader title="Help" helper="Articles" kicker="Support" />);
    expect(screen.getByText('Support')).toBeTruthy();
    render(<PageHeader title="Ticket" helper="Detail" />);
    expect(screen.getByRole('heading', { name: 'Ticket' })).toBeTruthy();
    const { container: emptyBanner } = render(<FormBanner />);
    expect(emptyBanner).toBeEmptyDOMElement();
    render(<FormBanner message="Failed" testId="banner" />);
    expect(screen.getByTestId('banner')).toHaveTextContent('Failed');
    render(
      <>
        <IconTile icon={Circle} />
        <IconTile icon={Circle} tone="muted" />
        <IconTile icon={Circle} tone="danger" />
        <IconTile icon={Circle} tone="contrast" size="lg" />
        <StatusBadge status="RESOLVED" />
        <StatusBadge status="OPEN" />
        <StatusBadge status="PENDING" />
        <StatusBadge status={null} />
      </>,
    );
    expect(screen.getByText('RESOLVED')).toBeTruthy();
    render(
      <SectionBlock
        id="section-ticket"
        title="Thread"
        hint="Replies"
        icon={LifeBuoy}
        footer={<button type="button">Retry</button>}
      >
        inner
      </SectionBlock>,
    );
    expect(screen.getByRole('heading', { name: 'Thread' })).toBeTruthy();
    render(
      <SectionBlock id="section-bare" title="Bare">
        inner
      </SectionBlock>,
    );
    expect(screen.getByRole('heading', { name: 'Bare' })).toBeTruthy();
    render(
      <EmptyState icon={LifeBuoy} testId="support-empty">
        No articles
      </EmptyState>,
    );
    expect(screen.getByTestId('support-empty')).toHaveTextContent(
      'No articles',
    );
    render(
      <EmptyState
        icon={LifeBuoy}
        testId="custom-empty"
        actions={<span>Add</span>}
      >
        <p>Custom</p>
      </EmptyState>,
    );
    expect(screen.getByTestId('custom-empty')).toHaveTextContent('Custom');
    render(<InputField label="Subject line" error="Required" />);
    expect(screen.getByLabelText('Subject line')).toBeTruthy();
    expect(screen.getByText('Required')).toBeTruthy();
    render(<TextareaField label="Reply text" error="Write more" />);
    expect(screen.getByLabelText('Reply text')).toBeTruthy();
    expect(screen.getByText('Write more')).toBeTruthy();
  });
});

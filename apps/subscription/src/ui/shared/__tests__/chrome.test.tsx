import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Circle } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AutoRenewSwitch } from '../auto-renew';
import { IconTile } from '../icon-tile';
import { Rule } from '../rule';

afterEach(() => {
  cleanup();
});

describe('subscription chrome', () => {
  it('renders a decorative rule', () => {
    const { container } = render(<Rule />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it('renders icon tiles in each tone and size', () => {
    render(
      <>
        <IconTile icon={Circle} />
        <IconTile icon={Circle} tone="muted" />
        <IconTile icon={Circle} tone="danger" />
        <IconTile icon={Circle} tone="contrast" size="lg" />
      </>,
    );
    expect(screen.getAllByRole('generic').length).toBeGreaterThan(0);
  });

  it('toggles auto-renew and shows off copy when disabled', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<AutoRenewSwitch checked onToggle={onToggle} />);
    expect(screen.getByLabelText('Auto-renew')).toBeChecked();
    expect(screen.getByText('Renews at the next cycle')).toBeTruthy();
    await user.click(screen.getByLabelText('Auto-renew'));
    expect(onToggle).toHaveBeenCalledWith(false);

    cleanup();
    render(<AutoRenewSwitch checked={false} disabled onToggle={onToggle} />);
    expect(screen.getByLabelText('Auto-renew')).not.toBeChecked();
    expect(screen.getByLabelText('Auto-renew')).toBeDisabled();
    expect(screen.getByText('Ends after this cycle')).toBeTruthy();
  });
});

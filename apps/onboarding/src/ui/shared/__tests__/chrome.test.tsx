import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FileDrop } from '../file-drop';
import { FlowRail } from '../flow-rail';
import { SectionBlock } from '../section-block';
import { SelectField } from '../select-field';

afterEach(() => {
  cleanup();
});

describe('FlowRail', () => {
  it('marks the current screen and supports both orientations', () => {
    const { rerender } = render(<FlowRail screen="kyc" />);
    expect(screen.getByText('Documents (current)')).toBeTruthy();
    expect(screen.getByText('Account (done)')).toBeTruthy();
    expect(
      screen.getByText('Documents (current)').closest('li'),
    ).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText('Review')).toBeTruthy();
    rerender(<FlowRail screen="register" orientation="horizontal" />);
    expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent(
      'Account (current)',
    );
    expect(screen.queryByText('Shop and owner')).toBeNull();
    rerender(<FlowRail screen="verify" orientation="horizontal" />);
    expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent(
      'Email (current)',
    );
    rerender(<FlowRail screen="kyc" orientation="horizontal" />);
    expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent(
      'Documents (current)',
    );
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent(
      'Account (done)',
    );
    rerender(<FlowRail screen="status" orientation="horizontal" />);
    expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent(
      'Review (current)',
    );
  });
});

describe('SectionBlock', () => {
  it('renders the section title, hint, and step', () => {
    render(
      <SectionBlock icon={User} title="Owner" hint="Mailbox" step={1}>
        <span>fields</span>
      </SectionBlock>,
    );
    expect(screen.getByRole('heading', { name: 'Owner' })).toBeTruthy();
    expect(screen.getByText('Mailbox')).toBeTruthy();
    expect(screen.getByText('1 / 4')).toBeTruthy();
    expect(screen.getByText('fields')).toBeTruthy();
  });
});

describe('FileDrop', () => {
  it('labels the file input and reports the chosen name', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<FileDrop id="kyc-file" fileName="gstin.pdf" onChange={onChange} />);
    expect(screen.getByLabelText('Document file')).toBeTruthy();
    expect(screen.getByText('gstin.pdf')).toBeTruthy();
    const file = new File(['x'], 'x.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Document file'), file);
    expect(onChange).toHaveBeenCalled();
  });

  it('clears when the file list is empty', () => {
    const onChange = vi.fn();
    render(<FileDrop id="kyc-file" disabled onChange={onChange} />);
    const input = screen.getByLabelText('Document file');
    fireEvent.change(input, { target: { files: [] } });
    expect(onChange).toHaveBeenCalledWith(null);
    expect((input as HTMLInputElement).disabled).toBe(true);
  });
});

describe('SelectField', () => {
  it('renders a field error', () => {
    render(
      <SelectField label="State" name="state" error="Pick a state.">
        <option value="Karnataka">Karnataka</option>
      </SelectField>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Pick a state.');
  });

  it('derives an id from the label', () => {
    render(
      <SelectField label="Document type">
        <option value="PAN_CARD">PAN card</option>
      </SelectField>,
    );
    expect(screen.getByLabelText('Document type')).toBeTruthy();
  });
});

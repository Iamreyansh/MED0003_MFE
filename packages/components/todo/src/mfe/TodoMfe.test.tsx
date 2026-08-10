import { createTodoEnvelope } from '@medmate/test-utils';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TodoMfe from '../mfe/TodoMfe';

afterEach(() => {
  cleanup();
});

describe('TodoMfe', () => {
  it('supports add toggle edit delete and filter via data props', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TodoMfe
        data={createTodoEnvelope({
          title: 'Pharmacy Tasks',
          initialItems: [{ id: '1', title: 'Count stock', completed: false }],
          onChange,
        })}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Pharmacy Tasks' }),
    ).toBeTruthy();

    await user.type(screen.getByLabelText('New todo'), 'Order refill');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByText('Order refill')).toBeTruthy();

    await user.click(screen.getByLabelText('Complete Order refill'));
    await user.click(screen.getByRole('button', { name: 'completed' }));
    expect(screen.getByText('Order refill')).toBeTruthy();
    expect(screen.queryByText('Count stock')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'all' }));
    const editButtons = screen.getAllByRole('button', { name: 'Edit' });
    await user.click(editButtons[0]!);
    const edit = screen.getByLabelText('Edit todo');
    await user.clear(edit);
    await user.type(edit, 'Count inventory');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText('Count inventory')).toBeTruthy();

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    await user.click(deleteButtons[0]!);
    expect(onChange).toHaveBeenCalled();
  });

  it('cancels edits and shows empty filter status', async () => {
    const user = userEvent.setup();
    render(
      <TodoMfe
        data={createTodoEnvelope({
          initialItems: [{ id: '1', title: 'Only active', completed: false }],
          initialFilter: 'completed',
        })}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'No todos for this filter.',
    );

    await user.click(screen.getByRole('button', { name: 'all' }));
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('Only active')).toBeTruthy();
  });

  it('uses default title when feature title is omitted', () => {
    render(<TodoMfe data={createTodoEnvelope({})} />);
    expect(screen.getByRole('heading', { name: 'Todo' })).toBeTruthy();
  });

  it('rejects incompatible envelopes', () => {
    expect(() =>
      render(
        <TodoMfe
          data={
            {
              contractVersion: '0.0.0',
              context: {
                hostId: 'x',
                locale: 'en',
                permissions: [],
              },
              feature: {},
            } as never
          }
        />,
      ),
    ).toThrow(/Unsupported/);
  });
});

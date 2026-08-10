import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button, Card, TextField } from './index';

afterEach(() => {
  cleanup();
});

describe('ui primitives', () => {
  it('renders card with title and children', () => {
    render(
      <Card title="Demo">
        <p>Body</p>
      </Card>,
    );
    expect(screen.getByRole('heading', { name: 'Demo' })).toBeTruthy();
    expect(screen.getByText('Body')).toBeTruthy();
  });

  it('renders card without title', () => {
    render(
      <Card>
        <p>Untitled</p>
      </Card>,
    );
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('fires button clicks for each variant', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Primary</Button>);
    await user.click(screen.getByRole('button', { name: 'Primary' }));
    rerender(
      <Button variant="ghost" onClick={onClick}>
        Ghost
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: 'Ghost' }));
    rerender(
      <Button variant="danger" onClick={onClick}>
        Danger
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: 'Danger' }));
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('associates text field label with input', async () => {
    const user = userEvent.setup();
    render(<TextField label="Title" name="title" />);
    const input = screen.getByLabelText('Title');
    await user.type(input, 'Buy milk');
    expect(input).toHaveProperty('value', 'Buy milk');
  });

  it('derives input id from label when name is omitted', () => {
    render(<TextField label="Free Text" />);
    expect(screen.getByLabelText('Free Text')).toHaveAttribute(
      'id',
      'free-text',
    );
  });
});

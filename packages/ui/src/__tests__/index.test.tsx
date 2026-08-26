import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Button,
  Card,
  Inline,
  PageSection,
  Stack,
  StatusMessage,
  TextField,
} from '../index';

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

describe('layout and feedback', () => {
  it('renders stack, wrapping inline, and page section', () => {
    render(
      <PageSection title="Tasks">
        <Stack>
          <Inline wrap>
            <span>One</span>
            <span>Two</span>
          </Inline>
        </Stack>
      </PageSection>,
    );
    expect(screen.getByRole('heading', { name: 'Tasks' })).toBeTruthy();
    expect(screen.getByText('One')).toBeTruthy();
  });

  it('renders page section and inline without optional flags', () => {
    render(
      <PageSection>
        <Inline>
          <span>Plain</span>
        </Inline>
      </PageSection>,
    );
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByText('Plain')).toBeTruthy();
  });

  it('exposes status messages with roles and tones', () => {
    const { rerender } = render(<StatusMessage>Loading todos</StatusMessage>);
    expect(screen.getByRole('status')).toHaveTextContent('Loading todos');
    rerender(<StatusMessage tone="info">Ready</StatusMessage>);
    expect(screen.getByRole('status')).toHaveTextContent('Ready');
    rerender(<StatusMessage tone="error">Failed</StatusMessage>);
    expect(screen.getByRole('status')).toHaveTextContent('Failed');
  });
});

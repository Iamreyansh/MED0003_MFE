import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Alert } from '../Alert';
import { Badge } from '../Badge';
import { Button } from '../Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../Card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '../Dialog';
import { Input } from '../Input';
import { InputOTP } from '../InputOTP';
import { Label } from '../Label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../Table';
import { TextField } from '../TextField';

afterEach(() => {
  cleanup();
});

describe('Button', () => {
  it('fires clicks for each variant and size', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Primary</Button>);
    await user.click(screen.getByRole('button', { name: 'Primary' }));
    rerender(
      <Button variant="ghost" size="lg" onClick={onClick}>
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

  it('merges onto a child with asChild', () => {
    render(
      <Button asChild>
        <a href="/login">Continue</a>
      </Button>,
    );
    expect(screen.getByRole('link', { name: 'Continue' })).toHaveAttribute(
      'href',
      '/login',
    );
  });
});

describe('TextField', () => {
  it('associates a label with the input', async () => {
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

  it('associates an error message with the field', () => {
    render(<TextField label="Email" name="email" error="Required" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<TextField label="Secret" name="secret" type="password" />);
    expect(screen.getByLabelText('Secret')).toHaveAttribute('type', 'password');
    cleanup();
    render(
      <TextField
        label="Password"
        name="password"
        type="password"
        error="Too short"
      />,
    );
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Show' }));
    expect(input).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: 'Hide' }));
    expect(input).toHaveAttribute('type', 'password');
  });
});

describe('Card and chrome', () => {
  it('renders a titled card and compound slots', () => {
    render(
      <Card title="Demo">
        <p>Body</p>
      </Card>,
    );
    expect(screen.getByRole('heading', { name: 'Demo' })).toBeTruthy();
    cleanup();
    render(
      <Card>
        <CardHeader>
          <CardTitle>Untitled</CardTitle>
          <CardDescription>Helper</CardDescription>
        </CardHeader>
        <CardContent>Inner</CardContent>
        <CardFooter>Actions</CardFooter>
      </Card>,
    );
    expect(screen.getByText('Helper')).toBeTruthy();
    expect(screen.getByText('Inner')).toBeTruthy();
  });

  it('renders alert, badge, label, and input', () => {
    render(
      <>
        <Alert>Failed</Alert>
        <Alert tone="info">Ready</Alert>
        <Alert tone="info" role="status">
          Named
        </Alert>
        <Badge>Default</Badge>
        <Badge tone="primary">Primary</Badge>
        <Label htmlFor="solo">Solo</Label>
        <Input id="solo" />
      </>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Failed');
    expect(screen.getByText('Ready')).toBeTruthy();
  });
});

describe('Table', () => {
  it('renders semantic table structure', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Device</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Chrome</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole('columnheader', { name: 'Device' })).toBeTruthy();
    expect(screen.getByText('Chrome')).toBeTruthy();
  });
});

describe('InputOTP', () => {
  it('treats a missing value as empty and accepts digits', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputOTP label="Code" onChange={onChange} />);
    await user.type(screen.getByLabelText('Code digit 1'), '9');
    expect(onChange).toHaveBeenCalled();
  });

  it('keeps a controlled value and disabled slots', () => {
    render(
      <InputOTP label="OTP" value="12" onChange={() => undefined} disabled />,
    );
    expect(screen.getByLabelText('OTP digit 1')).toHaveProperty('value', '1');
    expect(screen.getByLabelText('OTP digit 1')).toBeDisabled();
  });

  it('accepts a pasted 6-digit code on the hidden input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputOTP label="Email OTP" onChange={onChange} />);
    const hidden = screen.getByLabelText('Email OTP', { selector: 'input' });
    fireEvent.change(hidden, { target: { value: '12ab34' } });
    expect(onChange).toHaveBeenCalledWith('1234');
    await user.click(hidden);
    await user.paste('123456');
    expect(onChange).toHaveBeenCalledWith('123456');
    fireEvent.paste(hidden, {
      clipboardData: { getData: () => 'letters' },
    });
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('accepts a pasted code on the visible group', () => {
    const onChange = vi.fn();
    render(<InputOTP label="Email OTP" onChange={onChange} />);
    const group = screen.getByRole('group', { name: 'Email OTP' });
    fireEvent.paste(group, {
      clipboardData: { getData: () => '654321' },
    });
    expect(onChange).toHaveBeenCalledWith('654321');
    fireEvent.paste(group, {
      clipboardData: { getData: () => 'abc' },
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('Dialog', () => {
  it('opens from a trigger and closes with Escape', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke this session?</DialogTitle>
            <DialogDescription>
              The device will be signed out.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders a controlled dialog with portal and overlay', () => {
    render(
      <Dialog open>
        <DialogPortal>
          <DialogOverlay />
        </DialogPortal>
        <DialogContent>
          <DialogTitle>Locked</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole('dialog')).toHaveTextContent('Locked');
  });
});

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LogoField, logoFileError, MAX_LOGO_BYTES } from '../logo-field';

afterEach(() => {
  cleanup();
});

function pngFile(name = 'shop.png') {
  const bytes = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);
  return new File([bytes], name, { type: 'image/png' });
}

function changeLogoFile(file?: File) {
  fireEvent.change(screen.getByLabelText('Pharmacy logo'), {
    target: { files: file ? [file] : [] },
  });
}

describe('logoFileError', () => {
  it('rejects empty, oversize, and non-image files', () => {
    expect(
      logoFileError(new File([], 'empty.png', { type: 'image/png' })),
    ).toMatch(/choose/i);
    expect(
      logoFileError(
        new File([new Uint8Array(MAX_LOGO_BYTES + 1)], 'big.png', {
          type: 'image/png',
        }),
      ),
    ).toMatch(/2 MB/i);
    expect(
      logoFileError(new File(['gif'], 'shop.gif', { type: 'image/gif' })),
    ).toMatch(/PNG or JPG/i);
    expect(logoFileError(new File(['x'], 'shop.webp', { type: '' }))).toMatch(
      /PNG or JPG/i,
    );
    expect(
      logoFileError(new File(['x'], 'shop.jpg', { type: 'image/jpeg' })),
    ).toBeUndefined();
    expect(logoFileError(pngFile())).toBeUndefined();
    expect(
      logoFileError(new File(['x'], 'shop.jpg', { type: '' })),
    ).toBeUndefined();
  });
});

describe('LogoField', () => {
  it('uploads a valid file and keeps the optional URL collapsed', () => {
    const onFile = vi.fn();
    render(<LogoField url="" onFile={onFile} onUrlChange={vi.fn()} />);
    expect(screen.getByLabelText('Pharmacy logo')).toBeTruthy();
    expect(screen.queryByLabelText('Logo URL')).toBeNull();
    changeLogoFile(pngFile());
    expect(onFile).toHaveBeenCalledWith(expect.any(File));
    changeLogoFile();
  });

  it('shows a client error for gif files without uploading', async () => {
    const user = userEvent.setup();
    const onFile = vi.fn();
    render(<LogoField url="" onFile={onFile} onUrlChange={vi.fn()} />);
    changeLogoFile(new File(['gif'], 'board.gif', { type: 'image/gif' }));
    expect(screen.getByRole('alert').textContent).toMatch(/PNG or JPG/i);
    expect(onFile).not.toHaveBeenCalled();
    await user.click(screen.getByText('Have a logo link instead?'));
    fireEvent.change(screen.getByLabelText('Logo URL'), {
      target: { value: 'https://cdn.example/shop.png' },
    });
    await user.click(screen.getByText('Have a logo link instead?'));
    expect(screen.queryByLabelText('Logo URL')).toBeNull();
  });

  it('disables the picker for staff and reveals the URL field', async () => {
    const user = userEvent.setup();
    render(
      <LogoField
        url="https://cdn.example/shop.png"
        disabled
        onFile={vi.fn()}
        onUrlChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Pharmacy logo')).toBeDisabled();
    await user.click(screen.getByText('Have a logo link instead?'));
    expect(screen.getByLabelText('Logo URL')).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Logo URL'), {
      target: { value: 'https://cdn.example/other.png' },
    });
  });

  it('accepts a dropped png and ignores empty or busy drops', () => {
    const onFile = vi.fn();
    const { rerender } = render(
      <LogoField url="" onFile={onFile} onUrlChange={vi.fn()} />,
    );
    const zone = screen.getByTestId('logo-dropzone');
    const inner = zone.querySelector('input');
    fireEvent.dragEnter(zone);
    fireEvent.dragOver(zone);
    fireEvent.dragLeave(zone, { relatedTarget: inner });
    fireEvent.dragLeave(zone, { relatedTarget: document.body });
    fireEvent.drop(zone, { dataTransfer: { files: [] } });
    expect(onFile).not.toHaveBeenCalled();
    fireEvent.drop(zone, { dataTransfer: { files: [pngFile()] } });
    expect(onFile).toHaveBeenCalledWith(expect.any(File));
    rerender(<LogoField url="" busy onFile={onFile} onUrlChange={vi.fn()} />);
    expect(screen.getByText('Uploading…')).toBeTruthy();
    fireEvent.dragEnter(zone);
    fireEvent.drop(zone, { dataTransfer: { files: [pngFile()] } });
    expect(onFile).toHaveBeenCalledTimes(1);
  });

  it('hides blob preview URLs in the optional link field', async () => {
    const user = userEvent.setup();
    render(
      <LogoField
        url="blob:http://localhost/preview"
        busy
        onFile={vi.fn()}
        onUrlChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Pharmacy logo')).toBeDisabled();
    await user.click(screen.getByText('Have a logo link instead?'));
    expect(screen.getByLabelText('Logo URL')).toHaveValue('');
  });
});

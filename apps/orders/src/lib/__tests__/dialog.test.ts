import { describe, expect, it, vi } from 'vitest';
import { applyDialogOpen } from '../dialog';

describe('applyDialogOpen', () => {
  it('closes only when the dialog is dismissed', () => {
    const close = vi.fn();
    applyDialogOpen(true, close);
    expect(close).not.toHaveBeenCalled();
    applyDialogOpen(false, close);
    expect(close).toHaveBeenCalledTimes(1);
  });
});

import { describe, expect, it } from 'vitest';
import { PORTAL_COPY, resolveCopy, rootTestId } from '../copy';

describe('auth copy', () => {
  it('resolves defaults and overlays', () => {
    expect(resolveCopy('pharmacy').title).toBe(PORTAL_COPY.pharmacy.title);
    expect(resolveCopy('pharmacy', { title: 'Welcome' }).title).toBe('Welcome');
    expect(rootTestId('pharmacy')).toBe('login-page');
    expect(rootTestId('pos')).toBe('pos-login-page');
    expect(rootTestId('sessions')).toBe('sessions-page');
    expect(rootTestId('admin')).toBe('auth-mfe');
  });
});

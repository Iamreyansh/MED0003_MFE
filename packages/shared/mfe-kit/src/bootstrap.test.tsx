import { cleanup, screen } from '@testing-library/react';
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { mountStandalone } from './bootstrap';

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

describe('mountStandalone', () => {
  it('mounts into #root with StrictMode', () => {
    document.body.innerHTML = '<div id="root"></div>';
    act(() => {
      mountStandalone(<p>Hello MFE</p>);
    });
    expect(screen.getByText('Hello MFE')).toBeTruthy();
  });

  it('throws when root is missing', () => {
    expect(() => mountStandalone(<p>x</p>)).toThrow(/Root element #root/);
  });

  it('supports a custom root id without StrictMode', () => {
    document.body.innerHTML = '<div id="app"></div>';
    act(() => {
      mountStandalone(<span>Custom</span>, { rootId: 'app', strict: false });
    });
    expect(screen.getByText('Custom')).toBeTruthy();
  });
});

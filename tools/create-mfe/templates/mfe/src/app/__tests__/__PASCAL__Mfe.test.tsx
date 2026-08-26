import { createMfeEnvelope } from '@medmate/test-utils';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { __PASCAL__FeatureData } from '../../contract';
import __PASCAL__Mfe from '../__PASCAL__Mfe';

afterEach(() => {
  cleanup();
});

function envelope(feature: __PASCAL__FeatureData = {}) {
  return createMfeEnvelope({ feature });
}

describe('__PASCAL__Mfe', () => {
  it('renders host context from data', () => {
    render(<__PASCAL__Mfe data={envelope({ title: '__TITLE__ Demo' })} />);
    expect(
      screen.getByRole('heading', { name: '__TITLE__ Demo' }),
    ).toBeTruthy();
  });

  it('uses the default title when feature title is omitted', () => {
    render(<__PASCAL__Mfe data={envelope()} />);
    expect(screen.getByRole('heading', { name: '__TITLE__' })).toBeTruthy();
  });
});

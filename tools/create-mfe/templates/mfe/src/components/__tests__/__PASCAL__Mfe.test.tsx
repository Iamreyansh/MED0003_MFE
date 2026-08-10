import { cleanup, render, screen } from '@testing-library/react';
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { afterEach, describe, expect, it } from 'vitest';
import __PASCAL__Mfe from '../__PASCAL__Mfe';

afterEach(() => {
  cleanup();
});

describe('__PASCAL__Mfe', () => {
  it('renders host context from data', () => {
    render(
      <__PASCAL__Mfe
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: {
            hostId: 'test-host',
            locale: 'en-IN',
            permissions: [],
          },
          feature: { title: '__TITLE__ Demo' },
        }}
      />,
    );
    expect(
      screen.getByRole('heading', { name: '__TITLE__ Demo' }),
    ).toBeTruthy();
  });
});

import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Mfe from './Mfe';

afterEach(() => cleanup());

describe('__TITLE__ Mfe', () => {
  it('renders from data envelope', () => {
    render(
      <Mfe
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: {
            hostId: 'test',
            locale: 'en-IN',
            permissions: [],
          },
          feature: { title: '__TITLE__ Demo', message: 'Ready' },
        }}
      />,
    );
    expect(
      screen.getByRole('heading', { name: '__TITLE__ Demo' }),
    ).toBeTruthy();
    expect(screen.getByText('Ready')).toBeTruthy();
  });
});

import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import type { RxScreen } from '@medmate/rx-contract';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { RxLayout } from '../../layouts/RxLayout';
import RxMfe from '../RxMfe';
import {
  REGISTER_LIST,
  RETENTION,
  RX_DETAIL,
  RX_LIST,
  data,
  feature,
} from './helpers';

afterEach(() => {
  cleanup();
});

describe('RxMfe', () => {
  it('shows a contract error without a screen', () => {
    render(
      <RxMfe
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: { title: 'x' } as never,
        }}
      />,
    );
    expect(screen.getByTestId('rx-contract-error')).toBeTruthy();
  });
});

describe('RxLayout', () => {
  it('renders unknown screens', () => {
    render(
      <RxLayout
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: {
            screen: 'nope' as RxScreen,
            onSubmit: async () => ({ ok: true }),
          },
        }}
      />,
    );
    expect(screen.getByText('Unknown prescriptions screen.')).toBeTruthy();
  });

  it('routes queue, detail, and drug-register', async () => {
    const { rerender } = render(
      <RxMfe data={data(feature('queue', async () => RX_LIST))} />,
    );
    expect(await screen.findByTestId('rx-queue-page')).toBeTruthy();
    rerender(<RxMfe data={data(feature('detail', async () => RX_DETAIL))} />);
    expect(await screen.findByTestId('rx-detail-page')).toBeTruthy();
    rerender(
      <RxMfe
        data={data(
          feature('drug-register', async (command) =>
            command.action === 'loadRetention' ? RETENTION : REGISTER_LIST,
          ),
        )}
      />,
    );
    expect(await screen.findByTestId('rx-drug-register-page')).toBeTruthy();
  });
});

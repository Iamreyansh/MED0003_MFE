import type { CatalogueScreen } from '@medmate/catalogue-contract';
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CatalogueLayout } from '../../layouts/CatalogueLayout';
import CatalogueMfe from '../CatalogueMfe';
import { data, feature } from './helpers';

afterEach(() => {
  cleanup();
});

describe('CatalogueMfe', () => {
  it('shows a contract error without a screen', () => {
    render(
      <CatalogueMfe
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: { title: 'x' } as never,
        }}
      />,
    );
    expect(screen.getByTestId('catalogue-contract-error')).toBeTruthy();
  });
});

describe('CatalogueLayout', () => {
  it('renders unknown screens', () => {
    render(
      <CatalogueLayout
        data={{
          contractVersion: MFE_CONTRACT_VERSION,
          context: { hostId: 'x', locale: 'en-IN', permissions: [] },
          feature: {
            screen: 'nope' as CatalogueScreen,
            onSubmit: async () => ({ ok: true }),
          },
        }}
      />,
    );
    expect(screen.getByText('Unknown catalogue screen.')).toBeTruthy();
  });

  it('routes search and mapping layouts', () => {
    const { rerender } = render(
      <CatalogueMfe
        data={data(feature('search', async () => ({ ok: true, results: [] })))}
      />,
    );
    expect(screen.getByTestId('catalogue-search-page')).toBeTruthy();
    rerender(
      <CatalogueMfe
        data={data(
          feature('mapping', async () => ({ ok: true, mappings: [] })),
        )}
      />,
    );
    expect(screen.getByTestId('catalogue-mapping-page')).toBeTruthy();
  });
});

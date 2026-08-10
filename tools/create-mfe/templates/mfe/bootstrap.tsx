/**
 * Standalone harness — shared mfe-kit bootstrap only.
 */
import { MFE_CONTRACT_VERSION, type MfeProps } from '@medmate/contracts';
import { mountStandalone } from '@medmate/mfe-kit';
import { useMemo } from 'react';
import __PASCAL__Mfe from './src/components/__PASCAL__Mfe';

type Feature = { title?: string };
type Props = MfeProps<Feature>;

function StandaloneHarness() {
  const data = useMemo<Props['data']>(
    () => ({
      contractVersion: MFE_CONTRACT_VERSION,
      context: {
        hostId: '__NAME__-standalone',
        locale: 'en-IN',
        permissions: [],
      },
      feature: {
        title: '__TITLE__ MFE',
      },
    }),
    [],
  );

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>__TITLE__ standalone harness</h1>
      <__PASCAL__Mfe data={data} />
    </main>
  );
}

mountStandalone(<StandaloneHarness />);

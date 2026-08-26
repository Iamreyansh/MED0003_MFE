/**
 * Standalone harness — shared mfe-kit bootstrap only.
 */
import { MFE_CONTRACT_VERSION } from '@medmate/contracts';
import { mountStandalone, StandaloneShell } from '@medmate/mfe-kit';
import { useMemo } from 'react';
import __PASCAL__Mfe from '../app/__PASCAL__Mfe';
import type { __PASCAL__MfeProps } from '../contract';
import '@medmate/ui/styles.css';

function StandaloneHarness() {
  const data = useMemo<__PASCAL__MfeProps['data']>(
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
    <StandaloneShell title="__TITLE__ standalone harness">
      <__PASCAL__Mfe data={data} />
    </StandaloneShell>
  );
}

mountStandalone(<StandaloneHarness />);

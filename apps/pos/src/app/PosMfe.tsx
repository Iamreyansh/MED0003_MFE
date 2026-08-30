import { assertMfeDataEnvelope } from '@medmate/contracts';
import { isPosFeatureData } from '@medmate/pos-contract';
import { StatusMessage } from '@medmate/ui';
import type { PosMfeProps } from '../contract';
import { PosLayout } from '../layouts/PosLayout';

export default function PosMfe({ data }: PosMfeProps) {
  assertMfeDataEnvelope(data);
  if (!isPosFeatureData(data.feature)) {
    return (
      <StatusMessage tone="error" data-testid="pos-contract-error">
        POS module is missing a screen.
      </StatusMessage>
    );
  }
  return <PosLayout data={data} />;
}

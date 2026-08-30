import { assertMfeDataEnvelope } from '@medmate/contracts';
import { isRxFeatureData } from '@medmate/rx-contract';
import { StatusMessage } from '@medmate/ui';
import type { RxMfeProps } from '../contract';
import { RxLayout } from '../layouts/RxLayout';

export default function RxMfe({ data }: RxMfeProps) {
  assertMfeDataEnvelope(data);
  if (!isRxFeatureData(data.feature)) {
    return (
      <StatusMessage tone="error" data-testid="rx-contract-error">
        Prescriptions module is missing a screen.
      </StatusMessage>
    );
  }
  return <RxLayout data={data} />;
}

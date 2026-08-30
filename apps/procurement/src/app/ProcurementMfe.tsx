import { assertMfeDataEnvelope } from '@medmate/contracts';
import { isProcurementFeatureData } from '@medmate/procurement-contract';
import { StatusMessage } from '@medmate/ui';
import type { ProcurementMfeProps } from '../contract';
import { ProcurementLayout } from '../layouts/ProcurementLayout';

export default function ProcurementMfe({ data }: ProcurementMfeProps) {
  assertMfeDataEnvelope(data);
  if (!isProcurementFeatureData(data.feature)) {
    return (
      <StatusMessage tone="error" data-testid="procurement-contract-error">
        Procurement module is missing a screen.
      </StatusMessage>
    );
  }
  return <ProcurementLayout data={data} />;
}

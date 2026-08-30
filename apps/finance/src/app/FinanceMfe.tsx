import { assertMfeDataEnvelope } from '@medmate/contracts';
import { isFinanceFeatureData } from '@medmate/finance-contract';
import { StatusMessage } from '@medmate/ui';
import type { FinanceMfeProps } from '../contract';
import { FinanceLayout } from '../layouts/FinanceLayout';

export default function FinanceMfe({ data }: FinanceMfeProps) {
  assertMfeDataEnvelope(data);
  if (!isFinanceFeatureData(data.feature)) {
    return (
      <StatusMessage tone="error" data-testid="finance-contract-error">
        Finance module is missing a screen.
      </StatusMessage>
    );
  }
  return <FinanceLayout data={data} />;
}

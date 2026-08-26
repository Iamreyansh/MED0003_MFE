import { isAuthFeatureData } from '@medmate/auth-contract';
import { assertMfeDataEnvelope } from '@medmate/contracts';
import { StatusMessage } from '@medmate/ui';
import type { AuthMfeProps } from '../contract';
import { AuthShell } from '../layouts/AuthShell';

export default function AuthMfe({ data }: AuthMfeProps) {
  assertMfeDataEnvelope(data);
  if (!isAuthFeatureData(data.feature)) {
    return (
      <StatusMessage tone="error" data-testid="auth-contract-error">
        Auth module is missing portalType.
      </StatusMessage>
    );
  }
  return <AuthShell data={data} />;
}

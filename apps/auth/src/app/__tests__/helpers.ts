import type { AuthFeatureData, AuthPortalType } from '@medmate/auth-contract';
import { createMfeEnvelope } from '@medmate/test-utils';

export function feature(
  portalType: AuthPortalType,
  onSubmit: AuthFeatureData['onSubmit'] = async () => ({ ok: true }),
  extra: Partial<AuthFeatureData> = {},
): AuthFeatureData {
  return { portalType, onSubmit, ...extra };
}

export function data(next: AuthFeatureData) {
  return createMfeEnvelope({
    feature: next,
    context: { hostId: 'test-host', locale: 'en-IN', permissions: [] },
  });
}

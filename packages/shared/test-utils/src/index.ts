import {
  MFE_CONTRACT_VERSION,
  type HostContext,
  type MfeDataEnvelope,
} from '@medmate/contracts';
import {
  render,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

const DEFAULT_CONTEXT: HostContext = {
  hostId: 'test-host',
  locale: 'en-IN',
  pharmacyId: 'pharmacy-1',
  userId: 'user-1',
  permissions: [],
};

export type CreateMfeEnvelopeOptions<TFeature> = {
  feature?: TFeature;
  context?: Partial<HostContext>;
};

/** Generic envelope builder — feature packages should wrap this for typed helpers. */
export function createMfeEnvelope<TFeature = unknown>(
  options: CreateMfeEnvelopeOptions<TFeature> = {},
): MfeDataEnvelope<TFeature> {
  const feature = (options.feature ?? ({} as TFeature)) as TFeature;
  return {
    contractVersion: MFE_CONTRACT_VERSION,
    context: {
      ...DEFAULT_CONTEXT,
      ...options.context,
      permissions: options.context?.permissions ?? DEFAULT_CONTEXT.permissions,
    },
    feature,
  };
}

function Wrapper({ children }: { children: ReactNode }) {
  return children;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  return render(ui, { wrapper: Wrapper, ...options });
}

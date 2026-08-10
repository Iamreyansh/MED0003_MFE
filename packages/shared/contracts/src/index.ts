/**
 * Shared Module Federation contracts for NammaMedMate MFEs.
 *
 * Every remote root component MUST accept exactly one prop: `data`.
 * Hosts build a typed `MfeDataEnvelope` and pass it through that prop.
 *
 * Feature-specific payload types belong in each remote package
 * (e.g. `@medmate/todo` contract module), not here.
 */

export const MFE_CONTRACT_VERSION = '1.0.0' as const;

export type MfeContractVersion = typeof MFE_CONTRACT_VERSION;

export type HostContext = {
  /** Host application id, e.g. pharmacy-portal */
  hostId: string;
  /** Locale tag, e.g. en-IN */
  locale: string;
  /** Optional pharmacy/tenant context */
  pharmacyId?: string;
  /** Optional authenticated user id (never put secrets here) */
  userId?: string;
  /** RBAC permission codes granted to the current session */
  permissions: readonly string[];
};

export type HostNavigate = (path: string) => void;

export type HostApiRequest = {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
};

export type HostApiResponse<T = unknown> = {
  ok: boolean;
  status: number;
  data: T;
};

export type HostApi = {
  /**
   * Least-privilege HTTP facade owned by the host.
   * Remotes must not call backend URLs or attach tokens themselves.
   */
  request: <T = unknown>(input: HostApiRequest) => Promise<HostApiResponse<T>>;
};

export type HostEvents = {
  emit: (event: string, payload?: unknown) => void;
  on: (event: string, handler: (payload?: unknown) => void) => () => void;
};

export type HostTelemetry = {
  track: (event: string, properties?: Record<string, unknown>) => void;
};

export type HostCapabilities = {
  navigate?: HostNavigate;
  api?: HostApi;
  events?: HostEvents;
  telemetry?: HostTelemetry;
};

export type MfeDataEnvelope<TFeature = unknown> = {
  contractVersion: MfeContractVersion;
  context: HostContext;
  feature: TFeature;
  capabilities?: HostCapabilities;
};

export type MfeProps<TFeature = unknown> = {
  data: Readonly<MfeDataEnvelope<TFeature>>;
};

export function isSupportedContractVersion(version: string): boolean {
  return version === MFE_CONTRACT_VERSION;
}

export function assertMfeDataEnvelope(
  value: unknown,
): asserts value is MfeDataEnvelope {
  if (!value || typeof value !== 'object') {
    throw new Error('MFE data must be an object');
  }

  const envelope = value as Partial<MfeDataEnvelope>;
  if (typeof envelope.contractVersion !== 'string') {
    throw new Error('MFE data.contractVersion is required');
  }
  if (!isSupportedContractVersion(envelope.contractVersion)) {
    throw new Error(
      `Unsupported MFE contract version: ${envelope.contractVersion}`,
    );
  }
  if (!envelope.context || typeof envelope.context !== 'object') {
    throw new Error('MFE data.context is required');
  }
  if (!Array.isArray(envelope.context.permissions)) {
    throw new Error('MFE data.context.permissions must be an array');
  }
  if (typeof envelope.context.hostId !== 'string') {
    throw new Error('MFE data.context.hostId is required');
  }
  if (typeof envelope.context.locale !== 'string') {
    throw new Error('MFE data.context.locale is required');
  }
  if (!('feature' in envelope)) {
    throw new Error('MFE data.feature is required');
  }
}

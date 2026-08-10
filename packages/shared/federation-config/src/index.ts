export type EnvRecord = Record<string, string | undefined>;

export type FederationRemote = {
  type: 'module';
  name: string;
  entry: string;
  entryGlobalName: string;
  shareScope: string;
};

/** React singletons shared by host and remotes. */
export const REACT_SHARED = {
  react: {
    singleton: true,
    requiredVersion: '18.3.1',
    strictVersion: true,
  },
  'react-dom': {
    singleton: true,
    requiredVersion: '18.3.1',
    strictVersion: true,
  },
} as const;

/** Optional Redux singletons for remotes that use @medmate/mfe-kit stores. */
export const REDUX_SHARED = {
  '@reduxjs/toolkit': {
    singleton: true,
    requiredVersion: '^2.8.2',
  },
  'react-redux': {
    singleton: true,
    requiredVersion: '^9.2.0',
  },
} as const;

/** Combined shared map for Redux-backed remotes. */
export const MFE_SHARED = {
  ...REACT_SHARED,
  ...REDUX_SHARED,
} as const;

export const REMOTE_ENV_PATTERN = /^VITE_REMOTE_([A-Z0-9_]+)_URL$/;

export function buildFederationRemotes(
  env: EnvRecord,
): Record<string, FederationRemote> {
  const remotes: Record<string, FederationRemote> = {};

  for (const [key, value] of Object.entries(env)) {
    if (!value) continue;
    const match = REMOTE_ENV_PATTERN.exec(key);
    if (!match?.[1]) continue;
    const name = match[1].toLowerCase();
    remotes[name] = {
      type: 'module',
      name,
      entry: value,
      entryGlobalName: name,
      shareScope: 'default',
    };
  }

  return remotes;
}

export function remoteEnvKey(name: string): string {
  return `VITE_REMOTE_${name.toUpperCase().replace(/-/g, '_')}_URL`;
}

export function getRemoteUrl(name: string, env: EnvRecord): string | undefined {
  const value = env[remoteEnvKey(name)];
  return value && value.length > 0 ? value : undefined;
}

export function listConfiguredRemotes(env: EnvRecord): string[] {
  return Object.keys(buildFederationRemotes(env));
}

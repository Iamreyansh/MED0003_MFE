import { describe, expect, it } from 'vitest';
import {
  ALLOWED_MFE_DOMAIN_SUFFIXES,
  MFE_DOMAIN_SUFFIX_ENV,
  buildFederationRemotes,
  getRemoteUrl,
  listConfiguredRemotes,
  normalizeMfeDomainSuffix,
  remoteEnvKey,
  remoteManifestUrl,
} from '../index';

describe('federation-config', () => {
  it('builds remotes from VITE_REMOTE_*_URL env vars', () => {
    const remotes = buildFederationRemotes({
      VITE_REMOTE_TODO_URL: 'http://localhost:5101/mf-manifest.json',
      VITE_REMOTE_INVENTORY_URL: '',
      OTHER: 'ignored',
    });

    expect(remotes).toEqual({
      todo: {
        type: 'module',
        name: 'todo',
        entry: 'http://localhost:5101/mf-manifest.json',
        entryGlobalName: 'todo',
        shareScope: 'default',
      },
    });
  });

  it('reads a single remote URL and lists configured remotes', () => {
    const env = {
      VITE_REMOTE_TODO_URL:
        'https://todo.mfe.nammamedmate.com/mf-manifest.json',
    };
    expect(remoteEnvKey('todo')).toBe('VITE_REMOTE_TODO_URL');
    expect(getRemoteUrl('todo', env)).toBe(
      'https://todo.mfe.nammamedmate.com/mf-manifest.json',
    );
    expect(getRemoteUrl('missing', env)).toBeUndefined();
    expect(listConfiguredRemotes(env)).toEqual(['todo']);
  });

  it('builds convention URLs from an allowlisted domain suffix', () => {
    const production = { [MFE_DOMAIN_SUFFIX_ENV]: 'mfe.nammamedmate.com' };
    const staging = {
      [MFE_DOMAIN_SUFFIX_ENV]: 'staging.mfe.nammamedmate.com',
    };
    expect(getRemoteUrl('auth', production)).toBe(
      'https://auth.mfe.nammamedmate.com/mf-manifest.json',
    );
    expect(getRemoteUrl('todo', production)).toBe(
      'https://todo.mfe.nammamedmate.com/mf-manifest.json',
    );
    expect(getRemoteUrl('onboarding', staging)).toBe(
      'https://onboarding.staging.mfe.nammamedmate.com/mf-manifest.json',
    );
    expect(getRemoteUrl('rx-quotes', production)).toBe(
      'https://rx-quotes.mfe.nammamedmate.com/mf-manifest.json',
    );
    expect(listConfiguredRemotes(production)).toEqual([]);
  });

  it('lets an explicit VITE_REMOTE_*_URL win over the suffix', () => {
    expect(
      getRemoteUrl('auth', {
        VITE_MFE_DOMAIN_SUFFIX: 'mfe.nammamedmate.com',
        VITE_REMOTE_AUTH_URL: 'https://example.test/mf-manifest.json',
      }),
    ).toBe('https://example.test/mf-manifest.json');
    expect(
      getRemoteUrl('auth', {
        VITE_MFE_DOMAIN_SUFFIX: 'mfe.nammamedmate.com',
        VITE_REMOTE_AUTH_URL: '',
      }),
    ).toBe('https://auth.mfe.nammamedmate.com/mf-manifest.json');
  });

  it('ignores unknown suffixes and invalid remote names', () => {
    expect(
      getRemoteUrl('auth', { VITE_MFE_DOMAIN_SUFFIX: 'evil.example' }),
    ).toBeUndefined();
    expect(
      getRemoteUrl('../x', { VITE_MFE_DOMAIN_SUFFIX: 'mfe.nammamedmate.com' }),
    ).toBeUndefined();
    expect(
      getRemoteUrl('auth.foo', {
        VITE_MFE_DOMAIN_SUFFIX: 'mfe.nammamedmate.com',
      }),
    ).toBeUndefined();
    expect(remoteManifestUrl('auth', '')).toBeUndefined();
    expect(normalizeMfeDomainSuffix(undefined)).toBeUndefined();
    expect(normalizeMfeDomainSuffix('')).toBeUndefined();
    expect(normalizeMfeDomainSuffix('https://.mfe.nammamedmate.com/')).toBe(
      'mfe.nammamedmate.com',
    );
    expect(
      normalizeMfeDomainSuffix('HTTP://staging.mfe.nammamedmate.com'),
    ).toBe('staging.mfe.nammamedmate.com');
    expect(ALLOWED_MFE_DOMAIN_SUFFIXES).toEqual([
      'mfe.nammamedmate.com',
      'staging.mfe.nammamedmate.com',
    ]);
  });
});

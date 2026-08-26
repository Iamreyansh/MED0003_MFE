import { describe, expect, it } from 'vitest';
import {
  buildFederationRemotes,
  getRemoteUrl,
  listConfiguredRemotes,
  remoteEnvKey,
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
});

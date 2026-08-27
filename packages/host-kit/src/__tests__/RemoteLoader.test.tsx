import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  RemoteErrorBoundary,
  RemoteLoader,
  createDefaultRemoteImporter,
  defaultRemoteImporter,
  getFederationHost,
  toRemoteModuleId,
  type RemoteModule,
} from '../RemoteLoader';

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(globalThis as object, '__FEDERATION__');
});

describe('toRemoteModuleId', () => {
  it('normalizes expose paths', () => {
    expect(toRemoteModuleId('todo', './Mfe')).toBe('todo/Mfe');
    expect(toRemoteModuleId('todo', '/Mfe')).toBe('todo/Mfe');
    expect(toRemoteModuleId('todo', 'Mfe')).toBe('todo/Mfe');
  });
});

describe('federation host helpers', () => {
  it('returns undefined when federation global is missing', () => {
    expect(getFederationHost()).toBeUndefined();
  });

  it('falls back to the first instance when no name matches', () => {
    const loadRemote = vi.fn();
    (
      globalThis as unknown as {
        __FEDERATION__: {
          __INSTANCES__: Array<{
            options?: { name?: string };
            loadRemote: typeof loadRemote;
          }>;
        };
      }
    ).__FEDERATION__ = {
      __INSTANCES__: [
        { loadRemote },
        { options: { name: 'other' }, loadRemote },
      ],
    };
    expect(getFederationHost('missing')).toBeDefined();
  });

  it('prefers a matching host instance', async () => {
    const loadRemote = vi.fn(async () => ({
      default: function Remote() {
        return <div>ok</div>;
      },
    }));
    (
      globalThis as unknown as {
        __FEDERATION__: {
          __INSTANCES__: Array<{
            options?: { name?: string };
            loadRemote: typeof loadRemote;
          }>;
        };
      }
    ).__FEDERATION__ = {
      __INSTANCES__: [
        { options: { name: 'other' }, loadRemote: vi.fn() },
        { options: { name: 'pharmacy_portal_host' }, loadRemote },
      ],
    };

    expect(getFederationHost('pharmacy_portal_host')?.options?.name).toBe(
      'pharmacy_portal_host',
    );
    const importer = createDefaultRemoteImporter('pharmacy_portal_host');
    const mod = await importer('todo', './Mfe');
    expect(loadRemote).toHaveBeenCalledWith('todo/Mfe');
    expect(mod.default).toBeTypeOf('function');
  });

  it('throws when federation host is missing or incomplete', async () => {
    await expect(defaultRemoteImporter('todo', './Mfe')).rejects.toThrow(
      /Federation host instance is not ready/,
    );

    (
      globalThis as unknown as {
        __FEDERATION__: {
          __INSTANCES__: Array<{ loadRemote: () => Promise<unknown> }>;
        };
      }
    ).__FEDERATION__ = {
      __INSTANCES__: [
        {
          loadRemote: async () => ({}),
        },
      ],
    };
    await expect(defaultRemoteImporter('todo', './Mfe')).rejects.toThrow(
      /did not provide a default export/,
    );
  });
});

describe('RemoteLoader', () => {
  it('shows missing UI when remoteUrl is empty', () => {
    render(<RemoteLoader remote="todo" module="./Mfe" remoteUrl={null} />);
    expect(screen.getByTestId('remote-missing')).toBeInTheDocument();
  });

  it('shows a spinner while the remote is loading', async () => {
    let resolveLoad: (value: RemoteModule) => void = () => undefined;
    const loadRemote = vi.fn(
      () =>
        new Promise<RemoteModule>((resolve) => {
          resolveLoad = resolve;
        }),
    );

    render(
      <RemoteLoader
        remote="todo"
        module="./Mfe"
        remoteUrl="http://localhost:5101/mf-manifest.json"
        loadRemote={loadRemote}
      />,
    );

    expect(screen.getByTestId('remote-loading')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.queryByText(/micro-frontend/i)).toBeNull();

    resolveLoad({
      default: function Todo() {
        return <div data-testid="todo-mfe">ok</div>;
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('todo-mfe')).toBeInTheDocument();
    });
  });

  it('loads a remote module when importer succeeds', async () => {
    const loadRemote = vi.fn(async () => ({
      default: function Todo() {
        return <div data-testid="todo-mfe">ok</div>;
      },
    }));

    render(
      <RemoteLoader
        remote="todo"
        module="./Mfe"
        remoteUrl="http://localhost:5101/mf-manifest.json"
        loadRemote={loadRemote}
        componentProps={{ data: { hello: 'world' } }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('todo-mfe')).toBeInTheDocument();
    });
    expect(loadRemote).toHaveBeenCalledWith('todo', './Mfe');
  });

  it('renders error fallback when importer fails with Error', async () => {
    const loadRemote = vi.fn(async () => {
      throw new Error('boom');
    });

    render(
      <RemoteLoader
        remote="todo"
        module="./Mfe"
        remoteUrl="http://localhost:5101/mf-manifest.json"
        loadRemote={loadRemote}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('remote-error')).toBeInTheDocument();
    });
    expect(screen.getByTestId('remote-error-detail').textContent).toContain(
      'boom',
    );
  });

  it('stringifies non-Error importer failures', async () => {
    const loadRemote = vi.fn(async () => {
      throw 'plain-string-failure';
    });

    render(
      <RemoteLoader
        remote="todo"
        module="./Mfe"
        remoteUrl="http://localhost:5101/mf-manifest.json"
        loadRemote={loadRemote}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('remote-error-detail').textContent).toContain(
        'plain-string-failure',
      );
    });
  });

  it('supports a custom error fallback element on import failure', async () => {
    const loadRemote = vi.fn(async () => {
      throw new Error('nope');
    });

    render(
      <RemoteLoader
        remote="todo"
        module="./Mfe"
        remoteUrl="http://example.test/mf-manifest.json"
        loadRemote={loadRemote}
        errorFallback={<div data-testid="custom-error">custom</div>}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('custom-error')).toBeInTheDocument();
    });
  });

  it('uses default error UI when a remote component throws', async () => {
    render(
      <RemoteLoader
        remote="todo"
        module="./Mfe"
        remoteUrl="http://example.test/mf-manifest.json"
        loadRemote={async () => ({
          default: function Broken(): never {
            throw new Error('render fail');
          },
        })}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('remote-error')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('remote-error-detail')).toBeNull();
  });
});

describe('RemoteErrorBoundary', () => {
  it('renders fallback and invokes onError when a child throws', () => {
    const onError = vi.fn();
    function Boom(): never {
      throw new Error('render boom');
    }

    render(
      <RemoteErrorBoundary
        fallback={<div data-testid="boundary">down</div>}
        onError={onError}
      >
        <Boom />
      </RemoteErrorBoundary>,
    );

    expect(screen.getByTestId('boundary')).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
  });

  it('renders children when there is no error', () => {
    render(
      <RemoteErrorBoundary fallback={<div data-testid="boundary">down</div>}>
        <div data-testid="ok">ok</div>
      </RemoteErrorBoundary>,
    );
    expect(screen.getByTestId('ok')).toBeInTheDocument();
  });
});

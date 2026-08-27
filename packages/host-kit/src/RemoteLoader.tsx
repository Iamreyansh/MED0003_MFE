import { Spinner } from '@medmate/ui';
import {
  Component,
  Suspense,
  lazy,
  useMemo,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
} from 'react';

export type RemoteModule = {
  default: ComponentType<Record<string, unknown>>;
};

export type RemoteImporter = (
  remote: string,
  module: string,
) => Promise<RemoteModule>;

export type RemoteLoaderProps = {
  remote: string;
  module: string;
  /** Resolved remote manifest URL. When omitted/empty, shows missing-remote UI. */
  remoteUrl?: string | null;
  componentProps?: Record<string, unknown>;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  loadRemote?: RemoteImporter;
};

type ErrorBoundaryProps = {
  fallback: ReactNode;
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
};

type ErrorBoundaryState = { hasError: boolean };

type FederationHost = {
  options?: { name?: string };
  loadRemote: (id: string) => Promise<RemoteModule>;
};

type FederationGlobal = {
  __INSTANCES__?: FederationHost[];
};

export class RemoteErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public override state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/** Normalize `./Mfe` → `todo/Mfe` for the federation runtime. */
export function toRemoteModuleId(remote: string, module: string): string {
  const expose = module.replace(/^\.\//, '').replace(/^\//, '');
  return `${remote}/${expose}`;
}

/** Prefer the Vite-created host instance over a standalone createInstance call. */
export function getFederationHost(
  hostNameIncludes = 'host',
): FederationHost | undefined {
  const fed = (globalThis as unknown as { __FEDERATION__?: FederationGlobal })
    .__FEDERATION__;
  const instances = fed?.__INSTANCES__ ?? [];
  return (
    instances.find((instance) =>
      (instance.options?.name ?? '').includes(hostNameIncludes),
    ) ?? instances[0]
  );
}

/**
 * Uses the Module Federation host instance created by `@module-federation/vite`.
 * Do not call standalone `loadRemote` from `@module-federation/enhanced/runtime`
 * without createInstance — that throws RUNTIME-009.
 */
export function createDefaultRemoteImporter(
  hostNameIncludes = 'host',
): RemoteImporter {
  return async (remote, module) => {
    const id = toRemoteModuleId(remote, module);
    const host = getFederationHost(hostNameIncludes);
    if (!host?.loadRemote) {
      throw new Error('Federation host instance is not ready');
    }
    const loaded = await host.loadRemote(id);
    if (!loaded?.default) {
      throw new Error(`Remote "${id}" did not provide a default export`);
    }
    return loaded;
  };
}

export const defaultRemoteImporter: RemoteImporter =
  createDefaultRemoteImporter('host');

function MissingRemote({ remote }: { remote: string }) {
  return (
    <div role="alert" data-testid="remote-missing">
      Remote &quot;{remote}&quot; is not configured. Set VITE_REMOTE_
      {remote.toUpperCase()}_URL.
    </div>
  );
}

function DefaultRemoteError({
  remote,
  detail = '',
}: {
  remote: string;
  detail?: string;
}) {
  return (
    <div role="alert" data-testid="remote-error">
      Failed to load remote &quot;{remote}&quot;.
      {detail ? <pre data-testid="remote-error-detail">{detail}</pre> : null}
    </div>
  );
}

export function RemoteLoader({
  remote,
  module,
  remoteUrl,
  componentProps,
  fallback = <Spinner block />,
  errorFallback,
  loadRemote: loadRemoteFn = defaultRemoteImporter,
}: RemoteLoaderProps) {
  const resolvedErrorFallback = useMemo(
    () => errorFallback ?? <DefaultRemoteError remote={remote} />,
    [errorFallback, remote],
  );

  const LazyRemote = useMemo(() => {
    if (!remoteUrl) {
      return null;
    }

    return lazy(async () => {
      try {
        return await loadRemoteFn(remote, module);
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        return {
          default: function RemoteLoadFailure() {
            return errorFallback ? (
              <>{errorFallback}</>
            ) : (
              <DefaultRemoteError remote={remote} detail={detail} />
            );
          },
        };
      }
    });
  }, [remote, module, remoteUrl, loadRemoteFn, errorFallback]);

  if (!LazyRemote) {
    return <MissingRemote remote={remote} />;
  }

  return (
    <RemoteErrorBoundary fallback={resolvedErrorFallback}>
      <Suspense fallback={fallback}>
        <LazyRemote {...(componentProps ?? {})} />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

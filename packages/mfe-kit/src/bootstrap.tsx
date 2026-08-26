import { StrictMode, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

export type MountOptions = {
  /** DOM id to mount into. Defaults to `root`. */
  rootId?: string;
  /** Wrap children in React.StrictMode (default true). */
  strict?: boolean;
};

/**
 * Shared standalone bootstrap used by every MFE `bootstrap.tsx`.
 * Keeps createRoot / StrictMode / missing-root handling identical.
 */
export function mountStandalone(
  element: ReactNode,
  options: MountOptions = {},
): Root {
  const { rootId = 'root', strict = true } = options;
  const rootElement = document.getElementById(rootId);
  if (!rootElement) {
    throw new Error(`Root element #${rootId} not found`);
  }

  const root = createRoot(rootElement);
  root.render(strict ? <StrictMode>{element}</StrictMode> : element);
  return root;
}

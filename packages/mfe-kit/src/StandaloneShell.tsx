import type { ReactNode } from 'react';

export type StandaloneShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  /** Tailwind max-width. Defaults to `max-w-4xl`. */
  className?: string;
};

const DEFAULT_DESCRIPTION =
  'Developers can run this package alone before mounting it in a host.';

/**
 * Shared standalone harness chrome. Feature UI is passed as children.
 */
export function StandaloneShell({
  title,
  description = DEFAULT_DESCRIPTION,
  children,
  className,
}: StandaloneShellProps) {
  return (
    <main
      className={[
        'mx-auto px-4 py-8 font-mm text-mm-text',
        className ?? 'max-w-3xl',
      ].join(' ')}
    >
      <h1 className="mb-2 text-xl font-semibold">{title}</h1>
      <p className="mb-6 text-mm-muted">{description}</p>
      {children}
    </main>
  );
}

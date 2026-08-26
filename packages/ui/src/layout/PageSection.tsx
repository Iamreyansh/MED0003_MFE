import type { HTMLAttributes, ReactNode } from 'react';
import { Heading } from '../elements/Heading';
import { cn } from '../lib/cn';

export type PageSectionProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  children: ReactNode;
};

export function PageSection({
  title,
  children,
  className,
  ...props
}: PageSectionProps) {
  return (
    <section
      data-slot="page-section"
      className={cn(
        'rounded-mm border border-mm-border bg-mm-surface p-4 font-mm text-mm-text shadow-sm',
        className,
      )}
      {...props}
    >
      {title ? (
        <Heading level={2} className="mb-3">
          {title}
        </Heading>
      ) : null}
      {children}
    </section>
  );
}

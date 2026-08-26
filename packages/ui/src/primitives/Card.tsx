import type { HTMLAttributes, ReactNode } from 'react';

export type CardProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  children: ReactNode;
};

export function Card({ title, children, className = '', ...props }: CardProps) {
  return (
    <section
      className={`rounded-mm border border-mm-border bg-mm-surface p-4 font-mm text-mm-text shadow-sm ${className}`.trim()}
      {...props}
    >
      {title ? (
        <h2 className="mb-3 text-mm-title leading-mm">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}

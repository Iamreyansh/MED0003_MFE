import type { HTMLAttributes, ReactNode } from 'react';

export type InlineProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  wrap?: boolean;
};

export function Inline({
  children,
  wrap = false,
  className = '',
  ...props
}: InlineProps) {
  return (
    <div
      className={`flex flex-row items-center gap-2 ${wrap ? 'flex-wrap' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

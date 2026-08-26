import type { HTMLAttributes, ReactNode } from 'react';

export type StackProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Stack({ children, className = '', ...props }: StackProps) {
  return (
    <div className={`flex flex-col gap-3 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

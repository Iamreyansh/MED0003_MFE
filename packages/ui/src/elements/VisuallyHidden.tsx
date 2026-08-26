import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/cn';

export type VisuallyHiddenProps = ComponentPropsWithoutRef<'span'>;

export function VisuallyHidden({ className, ...props }: VisuallyHiddenProps) {
  return (
    <span
      data-slot="visually-hidden"
      className={cn(
        'absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0',
        '[clip-path:inset(50%)] [clip:rect(0,0,0,0)]',
        className,
      )}
      {...props}
    />
  );
}

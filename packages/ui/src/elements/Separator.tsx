import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/cn';

export type SeparatorProps = ComponentPropsWithoutRef<'hr'>;

export function Separator({ className, ...props }: SeparatorProps) {
  return (
    <hr
      data-slot="separator"
      className={cn('m-0 border-0 border-t border-mm-border', className)}
      {...props}
    />
  );
}

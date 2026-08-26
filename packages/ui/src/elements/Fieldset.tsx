import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/cn';

export type FieldsetProps = ComponentPropsWithoutRef<'fieldset'>;

export function Fieldset({ className, ...props }: FieldsetProps) {
  return (
    <fieldset
      data-slot="fieldset"
      className={cn(
        'm-0 min-w-0 rounded-mm border border-mm-border p-3 font-mm',
        className,
      )}
      {...props}
    />
  );
}

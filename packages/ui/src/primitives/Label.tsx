import * as LabelPrimitive from '@radix-ui/react-label';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/cn';

export type LabelProps = ComponentPropsWithoutRef<typeof LabelPrimitive.Root>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn('font-mm text-mm-text', className)}
      {...props}
    />
  );
}

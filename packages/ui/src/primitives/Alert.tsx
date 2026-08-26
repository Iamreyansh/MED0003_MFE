import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

const alertVariants = cva(
  'm-0 rounded-mm border px-3 py-2 font-mm text-mm-body',
  {
    variants: {
      tone: {
        error: 'border-mm-danger/40 bg-mm-danger/5 text-mm-status-error',
        info: 'border-mm-primary/40 bg-mm-primary-soft text-mm-status-info',
      },
    },
    defaultVariants: {
      tone: 'error',
    },
  },
);

export type AlertProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants>;

export function Alert({
  tone = 'error',
  className,
  role,
  ...props
}: AlertProps) {
  return (
    <div
      data-slot="alert"
      role={role ?? (tone === 'error' ? 'alert' : 'status')}
      className={cn(alertVariants({ tone }), className)}
      {...props}
    />
  );
}

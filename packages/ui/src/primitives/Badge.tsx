import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

const badgeVariants = cva(
  'inline-flex min-w-fit items-center rounded-full px-2 py-0.5 font-mm text-sm',
  {
    variants: {
      tone: {
        default: 'bg-mm-bg text-mm-muted',
        primary: 'bg-mm-primary-soft text-mm-primary',
      },
    },
    defaultVariants: {
      tone: 'default',
    },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ tone = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ tone }), className)}
      {...props}
    />
  );
}

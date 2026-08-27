import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

const spinnerVariants = cva(
  'inline-flex items-center justify-center text-mm-primary',
  {
    variants: {
      size: {
        sm: '[&_svg]:size-4',
        md: '[&_svg]:size-8',
        lg: '[&_svg]:size-10',
      },
      block: {
        true: 'flex min-h-48 w-full',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      block: false,
    },
  },
);

export type SpinnerProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof spinnerVariants> & {
    label?: string;
  };

export function Spinner({
  label = 'Loading',
  size = 'md',
  block = false,
  className,
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      data-slot="spinner"
      className={cn(spinnerVariants({ size, block }), className)}
      {...props}
    >
      <Loader2
        aria-hidden
        className="animate-spin motion-reduce:animate-none"
      />
    </div>
  );
}

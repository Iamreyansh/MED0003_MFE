import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center cursor-pointer rounded-lg font-mm text-mm-body transition-colors duration-mm ease-mm disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mm-focus',
  {
    variants: {
      variant: {
        primary:
          'border border-transparent bg-mm-primary text-mm-primary-contrast hover:bg-mm-primary-hover',
        ghost:
          'border border-mm-border bg-transparent text-mm-text hover:bg-mm-bg',
        danger:
          'border border-transparent bg-mm-danger text-mm-primary-contrast hover:bg-mm-danger-hover',
      },
      size: {
        md: 'min-h-11 px-3 py-2',
        lg: 'min-h-12 px-4 py-3',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot="button"
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };

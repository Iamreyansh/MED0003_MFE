import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import { Box, type BoxProps } from './Box';

const containerVariants = cva('mx-auto w-full px-4', {
  variants: {
    size: {
      sm: 'max-w-md',
      md: 'max-w-3xl',
      lg: 'max-w-6xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type ContainerProps = BoxProps & VariantProps<typeof containerVariants>;

export function Container({ size, className, ...props }: ContainerProps) {
  return (
    <Box
      data-slot="container"
      className={cn(containerVariants({ size }), className)}
      {...props}
    />
  );
}

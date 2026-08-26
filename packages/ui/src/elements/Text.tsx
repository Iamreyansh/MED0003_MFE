import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import { Box, type BoxProps } from './Box';

const textVariants = cva('m-0 font-mm', {
  variants: {
    tone: {
      default: 'text-mm-text',
      muted: 'text-mm-muted',
      error: 'text-mm-status-error',
    },
    size: {
      sm: 'text-sm',
      md: 'text-mm-body',
      lg: 'text-mm-title',
    },
  },
  defaultVariants: {
    tone: 'default',
    size: 'md',
  },
});

export type TextProps = BoxProps & VariantProps<typeof textVariants>;

export function Text({ as = 'p', tone, size, className, ...props }: TextProps) {
  return (
    <Box
      as={as}
      data-slot="text"
      className={cn(textVariants({ tone, size }), className)}
      {...props}
    />
  );
}

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import { Box, type BoxProps } from './Box';

const headingVariants = cva('m-0 font-mm-heading font-semibold leading-mm', {
  variants: {
    level: {
      1: 'text-mm-display',
      2: 'text-mm-title',
      3: 'text-mm-title',
      4: 'text-mm-body',
      5: 'text-sm',
      6: 'text-sm',
    },
  },
  defaultVariants: {
    level: 2,
  },
});

const HEADING_TAGS = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
} as const;

export type HeadingProps = BoxProps & VariantProps<typeof headingVariants>;

export function Heading({ as, level = 2, className, ...props }: HeadingProps) {
  return (
    <Box
      as={as ?? HEADING_TAGS[level ?? 2]}
      data-slot="heading"
      className={cn(headingVariants({ level }), className)}
      {...props}
    />
  );
}

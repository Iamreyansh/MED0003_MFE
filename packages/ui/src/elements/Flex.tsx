import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import { Box, type BoxProps } from './Box';

const flexVariants = cva('flex', {
  variants: {
    direction: {
      row: 'flex-row',
      column: 'flex-col',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    },
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
    },
    gap: {
      '0': 'gap-0',
      '1': 'gap-1',
      '2': 'gap-2',
      '3': 'gap-3',
      '4': 'gap-4',
      '6': 'gap-6',
      '8': 'gap-8',
    },
  },
  defaultVariants: {
    direction: 'row',
    align: 'stretch',
    justify: 'start',
    wrap: false,
    gap: '2',
  },
});

export type FlexProps = BoxProps & VariantProps<typeof flexVariants>;

export function Flex({
  direction,
  align,
  justify,
  wrap,
  gap,
  className,
  ...props
}: FlexProps) {
  return (
    <Box
      data-slot="flex"
      className={cn(
        flexVariants({ direction, align, justify, wrap, gap }),
        className,
      )}
      {...props}
    />
  );
}

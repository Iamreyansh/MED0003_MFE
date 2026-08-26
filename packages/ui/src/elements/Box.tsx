import { Slot } from '@radix-ui/react-slot';
import { forwardRef, type ElementType, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export type BoxProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  asChild?: boolean;
};

export const Box = forwardRef<HTMLElement, BoxProps>(function Box(
  { as, asChild = false, className, ...props },
  ref,
) {
  const Comp = asChild ? Slot : ((as ?? 'div') as ElementType);
  return (
    <Comp ref={ref} data-slot="box" className={cn(className)} {...props} />
  );
});

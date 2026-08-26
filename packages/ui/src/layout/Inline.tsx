import type { ReactNode } from 'react';
import { Flex, type FlexProps } from '../elements/Flex';

export type InlineProps = Omit<FlexProps, 'direction' | 'align'> & {
  children: ReactNode;
  wrap?: boolean;
};

export function Inline({ wrap = false, ...props }: InlineProps) {
  return (
    <Flex
      direction="row"
      align="center"
      gap="2"
      wrap={wrap}
      data-slot="inline"
      {...props}
    />
  );
}

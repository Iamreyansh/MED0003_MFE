import type { ReactNode } from 'react';
import { Flex, type FlexProps } from '../elements/Flex';

export type StackProps = Omit<FlexProps, 'direction'> & {
  children: ReactNode;
};

export function Stack({ gap = '3', ...props }: StackProps) {
  return <Flex direction="column" gap={gap} data-slot="stack" {...props} />;
}

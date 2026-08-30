import { Box, Flex } from '@medmate/ui';
import type { ReactNode } from 'react';

export function FilterToolbar({
  children,
  actions,
}: {
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <Flex
      align="end"
      gap="2"
      wrap
      className="[&_input]:min-h-10 [&_label]:text-sm [&_select]:min-h-10"
    >
      {children}
      {actions ? <Box className="shrink-0 pb-px">{actions}</Box> : null}
    </Flex>
  );
}

export function FilterField({
  grow,
  children,
}: {
  grow?: boolean;
  children: ReactNode;
}) {
  return (
    <Box
      className={grow ? 'min-w-[12rem] flex-1 md:max-w-xs' : 'min-w-[8.5rem]'}
    >
      {children}
    </Box>
  );
}

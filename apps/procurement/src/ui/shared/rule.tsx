import { Box, Flex } from '@medmate/ui';

export function Rule() {
  return (
    <Flex align="center" gap="2" className="mt-2" aria-hidden>
      <Box className="h-px min-w-0 flex-1 bg-mm-border" />
      <Box className="size-1.5 shrink-0 rotate-45 bg-mm-primary" />
      <Box className="h-px min-w-0 flex-1 bg-mm-border" />
    </Flex>
  );
}

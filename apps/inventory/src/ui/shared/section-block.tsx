import { Box, Fieldset, Flex, Heading, Text } from '@medmate/ui';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function SectionBlock({
  id,
  title,
  hint,
  icon: Icon,
  footer,
  children,
}: {
  id: string;
  title: string;
  hint: string;
  icon?: LucideIcon;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Fieldset
      id={id}
      className="overflow-hidden border-mm-border bg-mm-surface p-0 shadow-sm"
    >
      <Flex
        align="start"
        justify="between"
        gap="3"
        className="border-b border-mm-border px-4 py-3"
      >
        <Flex align="start" gap="3" className="min-w-0">
          {Icon ? (
            <Box className="flex size-9 shrink-0 items-center justify-center rounded-mm bg-mm-primary-soft text-mm-primary">
              <Icon className="size-5" aria-hidden />
            </Box>
          ) : null}
          <Box className="min-w-0">
            <Heading level={2} className="text-mm-title">
              {title}
            </Heading>
            <Text size="sm" tone="muted">
              {hint}
            </Text>
          </Box>
        </Flex>
      </Flex>
      <Box className="p-4">{children}</Box>
      {footer ? (
        <Flex
          align="center"
          justify="end"
          gap="3"
          className="border-t border-mm-border bg-mm-bg px-4 py-3"
        >
          {footer}
        </Flex>
      ) : null}
    </Fieldset>
  );
}

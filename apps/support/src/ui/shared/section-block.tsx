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
  hint?: string;
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
        align="center"
        justify="between"
        gap="2"
        className="border-b border-mm-border px-3 py-2"
      >
        <Flex align="center" gap="2" className="min-w-0">
          {Icon ? (
            <Box className="flex size-8 shrink-0 items-center justify-center rounded-mm bg-mm-primary-soft text-mm-primary">
              <Icon className="size-4" aria-hidden />
            </Box>
          ) : null}
          <Box className="min-w-0">
            <Heading level={2} className="text-mm-title">
              {title}
            </Heading>
            {hint ? (
              <Text size="sm" tone="muted">
                {hint}
              </Text>
            ) : null}
          </Box>
        </Flex>
      </Flex>
      <Box className="p-3">{children}</Box>
      {footer ? (
        <Flex
          align="center"
          justify="end"
          gap="2"
          className="border-t border-mm-border bg-mm-bg px-3 py-2"
        >
          {footer}
        </Flex>
      ) : null}
    </Fieldset>
  );
}

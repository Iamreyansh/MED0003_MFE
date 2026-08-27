import { Badge, Box, Fieldset, Flex, Heading, Text } from '@medmate/ui';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function SectionBlock({
  icon: Icon,
  title,
  hint,
  step,
  total = 4,
  children,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
  step: number;
  total?: number;
  children: ReactNode;
}) {
  return (
    <Fieldset className="overflow-hidden border-mm-border bg-mm-surface p-0">
      <Flex
        align="start"
        justify="between"
        gap="3"
        className="border-b border-mm-border px-4 py-3"
      >
        <Flex align="start" gap="3" className="min-w-0">
          <Box className="flex size-9 shrink-0 items-center justify-center rounded-mm bg-mm-primary-soft text-mm-primary">
            <Icon className="size-5" aria-hidden />
          </Box>
          <Box className="min-w-0">
            <Heading level={2} className="text-mm-title">
              {title}
            </Heading>
            <Text size="sm" tone="muted">
              {hint}
            </Text>
          </Box>
        </Flex>
        <Badge tone="primary">
          {step} / {total}
        </Badge>
      </Flex>
      <Box className="p-4">{children}</Box>
    </Fieldset>
  );
}

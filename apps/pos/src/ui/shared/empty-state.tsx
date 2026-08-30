import { Card, Flex, Stack, Text } from '@medmate/ui';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { IconTile } from './icon-tile';

export function EmptyState({
  icon,
  children,
  testId,
}: {
  icon: LucideIcon;
  children: ReactNode;
  testId: string;
}) {
  return (
    <Card data-testid={testId} role="status" className="p-3">
      <Flex align="center" gap="2">
        <IconTile icon={icon} tone="muted" />
        <Stack gap="1" className="min-w-0">
          {typeof children === 'string' ? (
            <Text size="sm">{children}</Text>
          ) : (
            children
          )}
        </Stack>
      </Flex>
    </Card>
  );
}

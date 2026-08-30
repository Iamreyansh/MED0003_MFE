import { Card, Flex, Stack, Text } from '@medmate/ui';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { IconTile } from './icon-tile';

export function EmptyState({
  icon,
  children,
  actions,
  testId,
}: {
  icon: LucideIcon;
  children: ReactNode;
  actions?: ReactNode;
  testId: string;
}) {
  return (
    <Card data-testid={testId} role="status">
      <Flex align="start" gap="3">
        <IconTile icon={icon} tone="muted" />
        <Stack gap="3" className="min-w-0">
          {typeof children === 'string' ? <Text>{children}</Text> : children}
          {actions}
        </Stack>
      </Flex>
    </Card>
  );
}

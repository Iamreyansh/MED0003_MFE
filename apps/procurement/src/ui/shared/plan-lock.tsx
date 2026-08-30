import { Box, Button, Flex, Stack, Text } from '@medmate/ui';
import { Lock } from 'lucide-react';
import { IconTile } from './icon-tile';

export function PlanLock({
  testId,
  message,
  viewPlansLabel,
  onViewPlans,
  isStaff,
}: {
  testId: string;
  message: string;
  viewPlansLabel: string;
  onViewPlans?: () => void;
  isStaff?: boolean;
}) {
  return (
    <Box
      as="section"
      role="status"
      data-testid={testId}
      className="rounded-mm border border-mm-primary/40 bg-mm-primary-soft p-5 shadow-sm"
    >
      <Flex align="start" gap="4" wrap>
        <IconTile icon={Lock} size="lg" />
        <Stack gap="3" className="min-w-0 flex-1">
          <Text>{message}</Text>
          {isStaff ? null : (
            <Button type="button" onClick={onViewPlans}>
              {viewPlansLabel}
            </Button>
          )}
        </Stack>
      </Flex>
    </Box>
  );
}

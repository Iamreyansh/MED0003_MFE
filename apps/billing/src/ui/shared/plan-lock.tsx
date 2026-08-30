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
      className="rounded-mm border border-mm-primary/40 bg-mm-primary-soft p-3 shadow-sm"
    >
      <Flex align="center" gap="3" wrap>
        <IconTile icon={Lock} />
        <Stack gap="2" className="min-w-0 flex-1">
          <Text size="sm">{message}</Text>
          {isStaff ? null : (
            <Button
              type="button"
              className="min-h-10 w-fit px-2 text-sm"
              onClick={onViewPlans}
            >
              {viewPlansLabel}
            </Button>
          )}
        </Stack>
      </Flex>
    </Box>
  );
}

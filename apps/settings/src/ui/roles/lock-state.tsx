import { Box, Button, Flex, Stack, Text } from '@medmate/ui';
import { Lock, ShieldOff } from 'lucide-react';
import { ROLES_COPY } from '../../lib/copy';
import { RoleIconTile } from './icon-tile';

export function RolesLockState({
  kind,
  isStaff,
  message,
  onViewPlans,
}: {
  kind: 'plan' | 'forbidden';
  isStaff: boolean;
  message?: string;
  onViewPlans?: () => void;
}) {
  if (kind === 'forbidden') {
    return (
      <Box
        as="section"
        role="alert"
        data-testid="roles-forbidden"
        className="rounded-mm border border-mm-danger/40 bg-mm-danger/5 p-5 shadow-sm"
      >
        <Flex align="start" gap="4">
          <RoleIconTile icon={ShieldOff} tone="danger" size="lg" />
          <Text>{message || ROLES_COPY.forbidden}</Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      as="section"
      role="status"
      data-testid="roles-plan-lock"
      className="rounded-mm border border-mm-primary/40 bg-mm-primary-soft p-5 shadow-sm"
    >
      <Flex align="start" gap="4" wrap>
        <RoleIconTile icon={Lock} size="lg" />
        <Stack gap="3" className="min-w-0 flex-1">
          <Text>
            {ROLES_COPY.planLock}
            {isStaff ? ROLES_COPY.planLockStaff : ''}
          </Text>
          {isStaff ? null : (
            <Button type="button" onClick={onViewPlans}>
              {ROLES_COPY.viewPlans}
            </Button>
          )}
        </Stack>
      </Flex>
    </Box>
  );
}

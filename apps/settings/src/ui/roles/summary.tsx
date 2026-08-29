import { Box, Card, Flex, Grid, Text } from '@medmate/ui';
import { Shield, UserCheck, Users } from 'lucide-react';
import { ROLES_COPY } from '../../lib/copy';
import { RoleIconTile } from './icon-tile';

export function RolesSummary({
  systemCount,
  customCount,
  assignedCount,
}: {
  systemCount: number;
  customCount: number;
  assignedCount: number;
}) {
  const items = [
    {
      label: ROLES_COPY.kpiSystem,
      value: systemCount,
      icon: Shield,
      tone: 'muted' as const,
    },
    {
      label: ROLES_COPY.kpiCustom,
      value: customCount,
      icon: Users,
      tone: 'primary' as const,
    },
    {
      label: ROLES_COPY.kpiAssigned,
      value: assignedCount,
      icon: UserCheck,
      tone: 'primary' as const,
    },
  ];

  return (
    <Grid
      gap="4"
      className="grid-cols-1 md:grid-cols-3"
      data-testid="roles-summary"
    >
      {items.map((item) => (
        <Card key={item.label} aria-label={item.label}>
          <Flex align="start" gap="3">
            <RoleIconTile icon={item.icon} tone={item.tone} />
            <Box className="min-w-0">
              <Text className="font-mm-heading text-mm-display font-semibold leading-none">
                {item.value}
              </Text>
              <Text size="sm" tone="muted" className="mt-1">
                {item.label}
              </Text>
            </Box>
          </Flex>
        </Card>
      ))}
    </Grid>
  );
}

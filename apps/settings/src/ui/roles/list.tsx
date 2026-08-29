import type { PharmacyRoleRow } from '@medmate/settings-contract';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Stack,
  StatusMessage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  VisuallyHidden,
} from '@medmate/ui';
import { Shield, UserPlus, Users } from 'lucide-react';
import { assignedStaffLabel, ROLES_COPY } from '../../lib/copy';
import { SectionBlock } from '../shared/section-block';
import { RoleIconTile } from './icon-tile';

export function RolesList({
  roles,
  customCount,
  canWrite,
  canEditPermissions,
  onCreate,
  onOpen,
  onDelete,
}: {
  roles: PharmacyRoleRow[];
  customCount: number;
  canWrite: boolean;
  canEditPermissions: boolean;
  onCreate: () => void;
  onOpen: (role: PharmacyRoleRow) => void;
  onDelete: (role: PharmacyRoleRow) => void;
}) {
  return (
    <Stack gap="4">
      <Flex align="center" justify="between" gap="3" wrap>
        <Text tone="muted">{ROLES_COPY.listHelper}</Text>
        {canWrite ? (
          <Button type="button" onClick={onCreate}>
            {ROLES_COPY.createRole}
          </Button>
        ) : (
          <StatusMessage>{ROLES_COPY.staffView}</StatusMessage>
        )}
      </Flex>
      {customCount === 0 ? (
        <Card data-testid="roles-empty-custom" role="status">
          <Flex align="start" gap="3">
            <RoleIconTile icon={UserPlus} />
            <Text>{ROLES_COPY.emptyCustom}</Text>
          </Flex>
        </Card>
      ) : null}
      <SectionBlock
        id="section-roles"
        title={ROLES_COPY.sectionTitle}
        hint={ROLES_COPY.sectionHint}
        icon={Shield}
      >
        <Table aria-label={ROLES_COPY.tableLabel}>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>
                <VisuallyHidden>Actions</VisuallyHidden>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id} data-testid={`role-row-${role.id}`}>
                <TableCell>
                  <Flex align="center" gap="3">
                    <RoleIconTile
                      icon={role.is_system ? Shield : Users}
                      tone={role.is_system ? 'muted' : 'primary'}
                    />
                    <Box className="min-w-0">
                      <Text className="font-semibold">{role.display_name}</Text>
                      <Text tone="muted" size="sm">
                        {role.name}
                      </Text>
                    </Box>
                  </Flex>
                </TableCell>
                <TableCell>
                  <Badge tone={role.is_system ? 'default' : 'primary'}>
                    {role.is_system
                      ? ROLES_COPY.typeSystem
                      : ROLES_COPY.typeCustom}
                  </Badge>
                </TableCell>
                <TableCell>
                  {assignedStaffLabel(role.staff_count ?? 0)}
                </TableCell>
                <TableCell>
                  <Flex gap="2" justify="end" wrap>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onOpen(role)}
                    >
                      {role.is_system || !canEditPermissions
                        ? ROLES_COPY.viewPermissions
                        : ROLES_COPY.editPermissions}
                    </Button>
                    {canWrite && !role.is_system ? (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => onDelete(role)}
                      >
                        {ROLES_COPY.deleteRole}
                      </Button>
                    ) : null}
                  </Flex>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionBlock>
    </Stack>
  );
}

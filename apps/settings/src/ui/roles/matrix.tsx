import type {
  PharmacyRoleRow,
  RolePermissionsPayload,
} from '@medmate/settings-contract';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Spinner,
  Stack,
  StatusMessage,
  Text,
} from '@medmate/ui';
import { Shield } from 'lucide-react';
import { ROLES_COPY } from '../../lib/copy';
import { CheckboxField } from '../shared/checkbox-field';
import { SectionBlock } from '../shared/section-block';
import { groupPermissions, titleCase } from './helpers';
import { RoleIconTile } from './icon-tile';

export function RolesMatrix({
  role,
  matrix,
  checked,
  dirty,
  busy,
  readOnly,
  loading,
  onBack,
  onToggle,
  onSave,
}: {
  role: PharmacyRoleRow;
  matrix: RolePermissionsPayload | null;
  checked: string[];
  dirty: boolean;
  busy: boolean;
  readOnly: boolean;
  loading: boolean;
  onBack: () => void;
  onToggle: (permission: string, next: boolean) => void;
  onSave: () => void;
}) {
  const groups = matrix ? groupPermissions(matrix.permissions) : [];
  const system = Boolean(matrix?.is_system || role.is_system);

  return (
    <Stack gap="4">
      <Flex align="start" justify="between" gap="3" wrap>
        <Flex align="start" gap="3" className="min-w-0">
          <RoleIconTile
            icon={Shield}
            tone={system ? 'muted' : 'primary'}
            size="lg"
          />
          <Box className="min-w-0">
            <Flex align="center" gap="2" wrap>
              <Heading level={2}>{role.display_name}</Heading>
              <Badge tone={system ? 'default' : 'primary'}>
                {system ? ROLES_COPY.typeSystem : ROLES_COPY.typeCustom}
              </Badge>
              {dirty ? (
                <Badge tone="primary">{ROLES_COPY.unsaved}</Badge>
              ) : null}
            </Flex>
            <Text tone="muted" size="sm" className="mt-1">
              {system ? ROLES_COPY.matrixSystemHint : ROLES_COPY.matrixHint}
            </Text>
          </Box>
        </Flex>
        <Button type="button" variant="ghost" onClick={onBack}>
          {ROLES_COPY.back}
        </Button>
      </Flex>
      {loading ? (
        <Spinner block label="Loading permissions" />
      ) : matrix ? (
        <SectionBlock
          id="section-permissions"
          title={ROLES_COPY.matrixTitle}
          hint={system ? ROLES_COPY.matrixSystemHint : ROLES_COPY.matrixHint}
          icon={Shield}
          footer={
            readOnly ? undefined : (
              <Button type="button" disabled={busy || !dirty} onClick={onSave}>
                {ROLES_COPY.savePermissions}
              </Button>
            )
          }
        >
          <Stack gap="3" data-testid="roles-matrix">
            <Grid gap="3" className="grid-cols-1 md:grid-cols-2">
              {groups.map((group) => (
                <Card
                  key={group.resource}
                  data-testid={`perm-${group.resource}`}
                >
                  <Heading level={3} className="mb-3">
                    {titleCase(group.resource)}
                  </Heading>
                  <Stack gap="2">
                    {group.items.map((item) => (
                      <CheckboxField
                        key={item.permission}
                        id={`perm-${item.permission}`}
                        name={item.permission}
                        label={titleCase(item.action)}
                        checked={checked.includes(item.permission)}
                        disabled={readOnly || busy}
                        onChange={(next) => onToggle(item.permission, next)}
                      />
                    ))}
                  </Stack>
                </Card>
              ))}
            </Grid>
            {readOnly ? (
              <StatusMessage>
                {matrix.is_system
                  ? ROLES_COPY.matrixReadOnlySystem
                  : ROLES_COPY.matrixReadOnlyStaff}
              </StatusMessage>
            ) : null}
          </Stack>
        </SectionBlock>
      ) : null}
    </Stack>
  );
}

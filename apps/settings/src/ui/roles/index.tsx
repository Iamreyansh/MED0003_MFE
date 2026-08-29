import type {
  PharmacyRoleRow,
  RolePermissionsPayload,
  SettingsFeatureData,
} from '@medmate/settings-contract';
import { roleNameFromDisplay } from '@medmate/settings-contract';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Spinner,
  Stack,
  TextField,
} from '@medmate/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ROLES_COPY } from '../../lib/copy';
import { DirtyLeaveGuard } from '../shared/dirty-leave';
import { FormBanner } from '../shared/form-error';
import { sameSet } from './helpers';
import { RolesList } from './list';
import { RolesLockState } from './lock-state';
import { RolesMatrix } from './matrix';
import { RolesSummary } from './summary';

const DEFAULT_CREATE_PERMISSIONS = ['orders:read'];

export function RolesScreen({
  feature,
  onNavigate,
}: {
  feature: SettingsFeatureData;
  onNavigate?: (path: string) => void;
}) {
  const canWrite = Boolean(feature.canWrite);
  const canEditPermissions = Boolean(
    feature.canEditPermissions ?? feature.canWrite,
  );
  const [roles, setRoles] = useState<PharmacyRoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(feature.formError);
  const [errorCode, setErrorCode] = useState<string | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PharmacyRoleRow | null>(
    null,
  );
  const [selected, setSelected] = useState<PharmacyRoleRow | null>(null);
  const [matrix, setMatrix] = useState<RolePermissionsPayload | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [leaveConfirm, setLeaveConfirm] = useState(false);

  const customRoles = roles.filter((role) => !role.is_system);
  const systemCount = roles.filter((role) => role.is_system).length;
  const assignedCount = roles.reduce(
    (sum, role) => sum + (role.staff_count ?? 0),
    0,
  );
  const locked = errorCode === 'MODULE_NOT_IN_PLAN';
  const forbidden =
    errorCode === 'FORBIDDEN' || errorCode === 'INSUFFICIENT_PERMISSIONS';
  const baseline = useMemo(
    () => matrix?.permissions.map((item) => item.permission) ?? [],
    [matrix],
  );
  const dirty = Boolean(matrix) && !sameSet(checked, baseline);
  const readOnlyMatrix = Boolean(matrix?.is_system) || !canEditPermissions;
  const isStaff = feature.role === 'pharmacy_staff';

  const loadRoles = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    setErrorCode(undefined);
    const result = await feature.onSubmit({ screen: 'roles', action: 'load' });
    setLoading(false);
    if (!result.ok) {
      setErrorCode(result.code);
      setError(result.formError ?? result.code ?? 'Unable to load roles.');
      return;
    }
    setRoles(result.roles ?? []);
  }, [feature]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  async function createRole() {
    const trimmedDisplay = displayName.trim();
    const derived = name.trim() || roleNameFromDisplay(trimmedDisplay);
    setBusy(true);
    setFieldErrors({});
    const result = await feature.onSubmit({
      screen: 'roles',
      action: 'create',
      values: {
        name: derived,
        display_name: trimmedDisplay,
        permissions: DEFAULT_CREATE_PERMISSIONS,
      },
    });
    setBusy(false);
    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {});
      setError(result.formError ?? result.code);
      setErrorCode(result.code);
      return;
    }
    setCreateOpen(false);
    setDisplayName('');
    setName('');
    setNameTouched(false);
    await loadRoles();
  }

  async function confirmDelete(target: PharmacyRoleRow) {
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'roles',
      action: 'delete',
      values: { id: target.id },
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.formError ?? result.code);
      setErrorCode(result.code);
      setPendingDelete(null);
      return;
    }
    setPendingDelete(null);
    await loadRoles();
  }

  async function openMatrix(role: PharmacyRoleRow) {
    setSelected(role);
    setMatrix(null);
    setMatrixLoading(true);
    setError(undefined);
    setErrorCode(undefined);
    const result = await feature.onSubmit({
      screen: 'roles',
      action: 'loadPermissions',
      values: { id: role.id },
    });
    setMatrixLoading(false);
    if (!result.ok) {
      setError(
        result.formError ?? result.code ?? 'Unable to load permissions.',
      );
      setErrorCode(result.code);
      return;
    }
    if (!result.rolePermissions) {
      setError('Unable to load permissions.');
      return;
    }
    setMatrix(result.rolePermissions);
    setChecked(
      result.rolePermissions.permissions.map((item) => item.permission),
    );
  }

  async function saveMatrix(role: PharmacyRoleRow) {
    setBusy(true);
    const result = await feature.onSubmit({
      screen: 'roles',
      action: 'savePermissions',
      values: { id: role.id, permissions: checked },
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.formError ?? result.code);
      setErrorCode(result.code);
      return;
    }
    await openMatrix(role);
  }

  function requestBack() {
    if (dirty) {
      setLeaveConfirm(true);
      return;
    }
    setSelected(null);
    setMatrix(null);
  }

  if (loading) {
    return <Spinner block label="Loading roles" />;
  }

  if (locked) {
    return (
      <RolesLockState
        kind="plan"
        isStaff={isStaff}
        onViewPlans={() => onNavigate?.('/subscription')}
      />
    );
  }

  if (forbidden && roles.length === 0 && !selected) {
    return (
      <RolesLockState kind="forbidden" isStaff={isStaff} message={error} />
    );
  }

  return (
    <Stack gap="4" data-testid="roles-panel">
      <DirtyLeaveGuard
        dirty={dirty}
        onNavigate={onNavigate}
        description={ROLES_COPY.dirtyLeave}
      />
      {error && !locked ? (
        <FormBanner
          message={error}
          testId={
            errorCode === 'INSUFFICIENT_PERMISSIONS'
              ? 'roles-insufficient'
              : 'roles-error'
          }
        />
      ) : null}
      {selected ? (
        <RolesMatrix
          role={selected}
          matrix={matrix}
          checked={checked}
          dirty={dirty}
          busy={busy}
          readOnly={readOnlyMatrix}
          loading={matrixLoading}
          onBack={requestBack}
          onToggle={(permission, next) => {
            setChecked((current) =>
              next
                ? [...current, permission]
                : current.filter((code) => code !== permission),
            );
          }}
          onSave={() => {
            void saveMatrix(selected);
          }}
        />
      ) : (
        <Stack gap="4">
          <RolesSummary
            systemCount={systemCount}
            customCount={customRoles.length}
            assignedCount={assignedCount}
          />
          <RolesList
            roles={roles}
            customCount={customRoles.length}
            canWrite={canWrite}
            canEditPermissions={canEditPermissions}
            onCreate={() => setCreateOpen(true)}
            onOpen={(role) => {
              void openMatrix(role);
            }}
            onDelete={setPendingDelete}
          />
        </Stack>
      )}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setFieldErrors({});
            setDisplayName('');
            setName('');
            setNameTouched(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create role</DialogTitle>
            <DialogDescription>
              Name a custom pack. Permissions start with order read and can be
              edited after create.
            </DialogDescription>
          </DialogHeader>
          <Stack gap="3" className="mb-4">
            <TextField
              label="Display name"
              name="display_name"
              value={displayName}
              error={fieldErrors.display_name}
              onChange={(event) => {
                setDisplayName(event.target.value);
                if (!nameTouched) {
                  setName(roleNameFromDisplay(event.target.value));
                }
              }}
            />
            <TextField
              label="Role code"
              name="name"
              value={name}
              error={fieldErrors.name}
              onChange={(event) => {
                setNameTouched(true);
                setName(event.target.value);
              }}
            />
          </Stack>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={busy || !displayName.trim()}
              onClick={() => {
                void createRole();
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {pendingDelete?.display_name ?? 'this role'}?
            </DialogTitle>
            <DialogDescription>
              Staff assigned this pack will need another role. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPendingDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={busy}
              onClick={() => {
                void confirmDelete(pendingDelete!);
              }}
            >
              Delete role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={leaveConfirm} onOpenChange={setLeaveConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave without saving?</DialogTitle>
            <DialogDescription>{ROLES_COPY.dirtyLeave}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setLeaveConfirm(false)}
            >
              Stay
            </Button>
            <Button
              type="button"
              onClick={() => {
                setLeaveConfirm(false);
                setSelected(null);
                setMatrix(null);
              }}
            >
              Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

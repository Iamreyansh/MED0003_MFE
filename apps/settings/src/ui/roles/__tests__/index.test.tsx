import type {
  PharmacyRoleRow,
  RolePermissionsPayload,
  SettingsCommand,
  SettingsSubmitResult,
} from '@medmate/settings-contract';
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { data, feature } from '../../../app/__tests__/helpers';
import SettingsMfe from '../../../app/SettingsMfe';

afterEach(() => {
  cleanup();
});

const SYSTEM_OWNER: PharmacyRoleRow = {
  id: 'system-owner',
  name: 'owner',
  display_name: 'Pharmacy Owner',
  is_system: true,
  permissions: ['*'],
  staff_count: 1,
};

const CUSTOM_ROLE: PharmacyRoleRow = {
  id: 'role-custom',
  name: 'night_shift',
  display_name: 'Night Shift',
  is_system: false,
  pharmacy_id: 'pharm-1',
  permissions: ['orders:read'],
  staff_count: 0,
};

const CUSTOM_PERMISSIONS: RolePermissionsPayload = {
  role_id: 'role-custom',
  role_name: 'night_shift',
  is_system: false,
  permissions: [
    { permission: 'orders:read', resource: 'orders', action: 'read' },
    { permission: 'orders:fulfill', resource: 'orders', action: 'fulfill' },
    { permission: 'inventory:write', resource: 'inventory', action: 'write' },
  ],
};

const OWNER_PERMISSIONS: RolePermissionsPayload = {
  role_id: 'system-owner',
  role_name: 'owner',
  is_system: true,
  permissions: [
    { permission: 'reports:read', resource: 'reports', action: 'read' },
  ],
};

function rolesSubmit(
  roles: PharmacyRoleRow[] = [SYSTEM_OWNER, CUSTOM_ROLE],
  overrides: Partial<
    Record<SettingsCommand['action'], () => Promise<SettingsSubmitResult>>
  > = {},
) {
  return vi.fn(
    async (command: SettingsCommand): Promise<SettingsSubmitResult> => {
      const override = overrides[command.action];
      if (override) {
        return override();
      }
      if (command.action === 'load') {
        return { ok: true, roles };
      }
      if (command.action === 'loadPermissions') {
        if (command.values.id === 'system-owner') {
          return { ok: true, rolePermissions: OWNER_PERMISSIONS };
        }
        return { ok: true, rolePermissions: CUSTOM_PERMISSIONS };
      }
      if (command.action === 'create') {
        return {
          ok: true,
          createdRole: {
            id: 'role-new',
            name: command.values.name,
            display_name: command.values.display_name,
            is_system: false,
            permissions: command.values.permissions,
          },
        };
      }
      if (command.action === 'delete' || command.action === 'savePermissions') {
        return { ok: true };
      }
      return { ok: true };
    },
  );
}

describe('RolesScreen', () => {
  it('lists system and custom roles and creates a pack', async () => {
    const user = userEvent.setup();
    const onSubmit = rolesSubmit();
    render(<SettingsMfe data={data(feature('roles', onSubmit))} />);
    expect(await screen.findByTestId('settings-roles-page')).toBeTruthy();
    expect(screen.getByTestId('roles-summary')).toBeTruthy();
    expect(screen.getByLabelText('System roles')).toHaveTextContent('1');
    expect(screen.getByLabelText('Custom packs')).toHaveTextContent('1');
    expect(screen.getByLabelText('Staff assigned')).toHaveTextContent('1');
    expect(screen.getByText('Pharmacy Owner')).toBeTruthy();
    expect(screen.getByText('Night Shift')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Create role' }));
    await user.type(screen.getByLabelText('Display name'), 'Senior Pharmacist');
    await user.clear(screen.getByLabelText('Role code'));
    await user.type(screen.getByLabelText('Role code'), 'senior_pharmacist');
    await user.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        screen: 'roles',
        action: 'create',
        values: {
          name: 'senior_pharmacist',
          display_name: 'Senior Pharmacist',
          permissions: ['orders:read'],
        },
      });
    });
  });

  it('confirms custom delete and hides delete on system roles', async () => {
    const user = userEvent.setup();
    const onSubmit = rolesSubmit();
    render(<SettingsMfe data={data(feature('roles', onSubmit))} />);
    expect(await screen.findByText('Night Shift')).toBeTruthy();
    expect(
      within(screen.getByTestId('role-row-system-owner')).queryByRole(
        'button',
        { name: 'Delete' },
      ),
    ).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(
      screen.getByRole('heading', { name: 'Delete Night Shift?' }),
    ).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(
      screen.queryByRole('heading', { name: 'Delete Night Shift?' }),
    ).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete role' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        screen: 'roles',
        action: 'delete',
        values: { id: 'role-custom' },
      });
    });
  });

  it('keeps a system row when Core forbids delete', async () => {
    const user = userEvent.setup();
    const onSubmit = rolesSubmit([SYSTEM_OWNER, CUSTOM_ROLE], {
      delete: async () => ({
        ok: false,
        code: 'FORBIDDEN',
        formError: 'System roles cannot be deleted',
      }),
    });
    render(<SettingsMfe data={data(feature('roles', onSubmit))} />);
    expect(await screen.findByText('Night Shift')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete role' }));
    expect(await screen.findByTestId('roles-error')).toHaveTextContent(
      'System roles cannot be deleted',
    );
    expect(screen.getByText('Night Shift')).toBeTruthy();
  });

  it('shows a lock panel without treating forbidden as an upgrade', async () => {
    const onSubmit = rolesSubmit([], {
      load: async () => ({
        ok: false,
        code: 'MODULE_NOT_IN_PLAN',
        formError: 'Roles are not included in this plan.',
      }),
    });
    render(<SettingsMfe data={data(feature('roles', onSubmit))} />);
    expect(await screen.findByTestId('roles-plan-lock')).toBeTruthy();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'View plans' }));
    expect(screen.getByRole('button', { name: 'View plans' })).toBeTruthy();
    cleanup();
    render(
      <SettingsMfe
        data={data(
          feature('roles', onSubmit, {
            role: 'pharmacy_staff',
            canWrite: false,
          }),
        )}
      />,
    );
    expect(await screen.findByTestId('roles-plan-lock')).toBeTruthy();
    expect(screen.getByText(/Ask the pharmacy owner to upgrade/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'View plans' })).toBeNull();
  });

  it('shows forbidden without an upgrade CTA', async () => {
    const onSubmit = rolesSubmit([], {
      load: async () => ({
        ok: false,
        code: 'INSUFFICIENT_PERMISSIONS',
        formError: 'You do not have permission to do that.',
      }),
    });
    render(<SettingsMfe data={data(feature('roles', onSubmit))} />);
    const panel = await screen.findByTestId('roles-forbidden');
    expect(panel.textContent).toMatch(/permission/i);
    expect(panel.textContent).not.toMatch(/upgrade/i);
    expect(screen.queryByRole('button', { name: 'View plans' })).toBeNull();
  });

  it('hints when only system roles exist', async () => {
    const onSubmit = rolesSubmit([SYSTEM_OWNER]);
    render(<SettingsMfe data={data(feature('roles', onSubmit))} />);
    expect(await screen.findByTestId('roles-empty-custom')).toBeTruthy();
    expect(screen.getByText('Pharmacy Owner')).toBeTruthy();
  });

  it('opens a custom matrix, toggles by keyboard, and PUTs the set', async () => {
    const user = userEvent.setup();
    const onSubmit = rolesSubmit();
    render(<SettingsMfe data={data(feature('roles', onSubmit))} />);
    expect(await screen.findByText('Night Shift')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Edit permissions' }));
    expect(await screen.findByTestId('roles-matrix')).toBeTruthy();
    const fulfill = screen.getByLabelText('Fulfill');
    fulfill.focus();
    expect(fulfill).toHaveFocus();
    await user.keyboard(' ');
    await user.click(screen.getByRole('button', { name: 'Save permissions' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        screen: 'roles',
        action: 'savePermissions',
        values: {
          id: 'role-custom',
          permissions: ['orders:read', 'inventory:write'],
        },
      });
    });
  });

  it('keeps the owner matrix read-only', async () => {
    const user = userEvent.setup();
    const onSubmit = rolesSubmit([SYSTEM_OWNER]);
    render(<SettingsMfe data={data(feature('roles', onSubmit))} />);
    expect(await screen.findByText('Pharmacy Owner')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'View permissions' }));
    expect(await screen.findByTestId('roles-matrix')).toBeTruthy();
    expect(screen.getByLabelText('Read')).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Save permissions' }),
    ).toBeNull();
  });

  it('does not invent permissions omitted from GET', async () => {
    const user = userEvent.setup();
    const onSubmit = rolesSubmit();
    render(<SettingsMfe data={data(feature('roles', onSubmit))} />);
    expect(await screen.findByText('Night Shift')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Edit permissions' }));
    expect(await screen.findByTestId('roles-matrix')).toBeTruthy();
    expect(screen.queryByLabelText('Manage')).toBeNull();
    expect(screen.getByLabelText('Write')).toBeTruthy();
  });

  it('shows VALIDATION_ERROR when an empty set is rejected', async () => {
    const user = userEvent.setup();
    const onSubmit = rolesSubmit([SYSTEM_OWNER, CUSTOM_ROLE], {
      savePermissions: async () => ({
        ok: false,
        code: 'VALIDATION_ERROR',
        formError: 'permissions are required',
      }),
    });
    render(<SettingsMfe data={data(feature('roles', onSubmit))} />);
    expect(await screen.findByText('Night Shift')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Edit permissions' }));
    expect(await screen.findByTestId('roles-matrix')).toBeTruthy();
    await user.click(screen.getByLabelText('Read'));
    await user.click(screen.getByLabelText('Fulfill'));
    await user.click(screen.getByLabelText('Write'));
    await user.click(screen.getByRole('button', { name: 'Save permissions' }));
    expect(await screen.findByTestId('roles-error')).toHaveTextContent(
      'permissions are required',
    );
    cleanup();
    const denied = rolesSubmit([CUSTOM_ROLE], {
      savePermissions: async () => ({
        ok: false,
        code: 'INSUFFICIENT_PERMISSIONS',
      }),
    });
    render(<SettingsMfe data={data(feature('roles', denied))} />);
    expect(await screen.findByText('Night Shift')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Edit permissions' }));
    expect(await screen.findByTestId('roles-matrix')).toBeTruthy();
    await user.click(screen.getByLabelText('Read'));
    await user.click(screen.getByRole('button', { name: 'Save permissions' }));
    expect(await screen.findByTestId('roles-insufficient')).toBeTruthy();
    expect(screen.getByTestId('roles-insufficient').textContent).not.toMatch(
      /upgrade/i,
    );
  });

  it('confirms leaving a dirty matrix', async () => {
    const user = userEvent.setup();
    const onSubmit = rolesSubmit();
    render(<SettingsMfe data={data(feature('roles', onSubmit))} />);
    expect(await screen.findByText('Night Shift')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Edit permissions' }));
    expect(await screen.findByTestId('roles-matrix')).toBeTruthy();
    await user.click(screen.getByLabelText('Fulfill'));
    expect(screen.getByText('Unsaved changes')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Back to roles' }));
    expect(
      screen.getByRole('heading', { name: 'Leave without saving?' }),
    ).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Leave' }));
    expect(screen.getByText('Night Shift')).toBeTruthy();
  });

  it('shows ROLE_NOT_FOUND for a stale matrix id', async () => {
    const user = userEvent.setup();
    const onSubmit = rolesSubmit([CUSTOM_ROLE], {
      loadPermissions: async () => ({
        ok: false,
        code: 'ROLE_NOT_FOUND',
        formError: 'This role is no longer available.',
      }),
    });
    render(<SettingsMfe data={data(feature('roles', onSubmit))} />);
    expect(await screen.findByText('Night Shift')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Edit permissions' }));
    expect(await screen.findByTestId('roles-error')).toHaveTextContent(
      'This role is no longer available.',
    );
    cleanup();
    const emptyPayload = rolesSubmit([CUSTOM_ROLE], {
      loadPermissions: async () => ({ ok: true }),
    });
    render(<SettingsMfe data={data(feature('roles', emptyPayload))} />);
    expect(await screen.findByText('Night Shift')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Edit permissions' }));
    expect(await screen.findByTestId('roles-error')).toHaveTextContent(
      'Unable to load permissions.',
    );
  });

  it('hides create and delete for staff', async () => {
    const user = userEvent.setup();
    const onSubmit = rolesSubmit();
    render(
      <SettingsMfe
        data={data(
          feature('roles', onSubmit, {
            canWrite: false,
            canEditPermissions: false,
            role: 'pharmacy_staff',
          }),
        )}
      />,
    );
    expect(await screen.findByText('Night Shift')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Create role' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();
    await user.click(
      screen.getAllByRole('button', { name: 'View permissions' })[1]!,
    );
    expect(await screen.findByTestId('roles-matrix')).toBeTruthy();
    expect(screen.getByText(/You can view permissions/)).toBeTruthy();
  });

  it('navigates to plans from the lock panel and covers editor chrome', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    const lockSubmit = rolesSubmit([], {
      load: async () => ({
        ok: false,
        code: 'MODULE_NOT_IN_PLAN',
        formError: 'Roles are not included in this plan.',
      }),
    });
    render(
      <SettingsMfe
        data={{
          ...data(feature('roles', lockSubmit)),
          capabilities: { navigate },
        }}
      />,
    );
    await user.click(await screen.findByRole('button', { name: 'View plans' }));
    expect(navigate).toHaveBeenCalledWith('/subscription');
    cleanup();
    const extraPerms: RolePermissionsPayload = {
      role_id: 'role-extra',
      role_name: 'extra',
      is_system: false,
      permissions: [
        { permission: 'custom:do', resource: 'custom', action: 'do' },
      ],
    };
    const extraSubmit = vi.fn(
      async (command: SettingsCommand): Promise<SettingsSubmitResult> => {
        if (command.action === 'load') {
          return { ok: true, roles: [CUSTOM_ROLE] };
        }
        if (command.action === 'loadPermissions') {
          return { ok: true, rolePermissions: extraPerms };
        }
        if (command.action === 'create') {
          return {
            ok: false,
            code: 'VALIDATION_ERROR',
            fieldErrors: { name: 'name is required' },
            formError: 'Check the highlighted fields and try again.',
          };
        }
        return { ok: true };
      },
    );
    render(<SettingsMfe data={data(feature('roles', extraSubmit))} />);
    expect(await screen.findByText('Night Shift')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Create role' }));
    expect(screen.getByRole('heading', { name: 'Create role' })).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('heading', { name: 'Create role' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Create role' }));
    await user.type(screen.getByLabelText('Display name'), 'Bad');
    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(await screen.findByText('name is required')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Edit permissions' }));
    expect(await screen.findByTestId('perm-custom')).toBeTruthy();
    await user.click(screen.getByLabelText('Do'));
    await user.click(screen.getByLabelText('Do'));
    await user.click(screen.getByRole('button', { name: 'Back to roles' }));
    expect(screen.getByText('Night Shift')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Edit permissions' }));
    await user.click(await screen.findByLabelText('Do'));
    await user.click(screen.getByRole('button', { name: 'Back to roles' }));
    await user.click(screen.getByRole('button', { name: 'Stay' }));
    expect(screen.getByTestId('roles-matrix')).toBeTruthy();
  });

  it('covers Core payload fallbacks on load, create, and delete', async () => {
    const user = userEvent.setup();
    const uncounted: PharmacyRoleRow = {
      id: 'role-bare',
      name: 'bare',
      display_name: 'Bare Pack',
      is_system: false,
      permissions: ['orders:read'],
    };
    const loadBare = rolesSubmit([uncounted]);
    render(
      <SettingsMfe
        data={data(
          feature('roles', loadBare, { canEditPermissions: undefined }),
        )}
      />,
    );
    expect(await screen.findByText('Bare Pack')).toBeTruthy();
    expect(screen.getByTestId('role-row-role-bare')).toHaveTextContent('0');
    expect(
      screen.getByRole('button', { name: 'Edit permissions' }),
    ).toBeTruthy();
    cleanup();

    const emptyLoad = vi.fn(async () => ({ ok: true }));
    render(<SettingsMfe data={data(feature('roles', emptyLoad))} />);
    expect(await screen.findByTestId('roles-empty-custom')).toBeTruthy();
    cleanup();

    const failedLoad = vi.fn(async () => ({ ok: false }));
    render(<SettingsMfe data={data(feature('roles', failedLoad))} />);
    expect(await screen.findByTestId('roles-error')).toHaveTextContent(
      'Unable to load roles.',
    );
    cleanup();

    const forbiddenEmpty = vi.fn(async () => ({
      ok: false,
      code: 'FORBIDDEN',
      formError: '',
    }));
    render(<SettingsMfe data={data(feature('roles', forbiddenEmpty))} />);
    expect(await screen.findByTestId('roles-forbidden')).toHaveTextContent(
      'You do not have permission to do that.',
    );
    cleanup();

    const createFallback = rolesSubmit([CUSTOM_ROLE], {
      create: async () => ({ ok: false, code: 'ROLE_NAME_CONFLICT' }),
      delete: async () => ({ ok: false, code: 'ROLE_IN_USE' }),
    });
    render(<SettingsMfe data={data(feature('roles', createFallback))} />);
    expect(await screen.findByText('Night Shift')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Create role' }));
    await user.type(screen.getByLabelText('Display name'), 'Dawn Shift');
    await user.clear(screen.getByLabelText('Role code'));
    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(await screen.findByTestId('roles-error')).toHaveTextContent(
      'ROLE_NAME_CONFLICT',
    );
    expect(createFallback).toHaveBeenCalledWith({
      screen: 'roles',
      action: 'create',
      values: {
        name: 'dawn_shift',
        display_name: 'Dawn Shift',
        permissions: ['orders:read'],
      },
    });
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete role' }));
    expect(await screen.findByTestId('roles-error')).toHaveTextContent(
      'ROLE_IN_USE',
    );
    cleanup();

    const permCodeOnly = rolesSubmit([CUSTOM_ROLE], {
      loadPermissions: async () => ({ ok: false, code: 'ROLE_NOT_FOUND' }),
    });
    render(<SettingsMfe data={data(feature('roles', permCodeOnly))} />);
    expect(await screen.findByText('Night Shift')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Edit permissions' }));
    expect(await screen.findByTestId('roles-error')).toHaveTextContent(
      'ROLE_NOT_FOUND',
    );
    cleanup();

    const permBareFail = rolesSubmit([CUSTOM_ROLE], {
      loadPermissions: async () => ({ ok: false }),
    });
    render(<SettingsMfe data={data(feature('roles', permBareFail))} />);
    expect(await screen.findByText('Night Shift')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Edit permissions' }));
    expect(await screen.findByTestId('roles-error')).toHaveTextContent(
      'Unable to load permissions.',
    );
  });
});

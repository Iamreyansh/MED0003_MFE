import type { RolePermissionItem } from '@medmate/settings-contract';
import { ROLE_PERMISSION_RESOURCES } from '@medmate/settings-contract';

export function titleCase(value: string): string {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function groupPermissions(items: RolePermissionItem[]) {
  const groups = new Map<string, RolePermissionItem[]>();
  for (const item of items) {
    const list = groups.get(item.resource) ?? [];
    list.push(item);
    groups.set(item.resource, list);
  }
  const ordered: { resource: string; items: RolePermissionItem[] }[] = [];
  const seen = new Set<string>();
  for (const resource of ROLE_PERMISSION_RESOURCES) {
    const grouped = groups.get(resource);
    if (grouped) {
      ordered.push({ resource, items: grouped });
      seen.add(resource);
    }
  }
  for (const [resource, grouped] of groups) {
    if (!seen.has(resource)) {
      ordered.push({ resource, items: grouped });
    }
  }
  return ordered;
}

export function sameSet(
  left: readonly string[],
  right: readonly string[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }
  const next = new Set(right);
  return left.every((item) => next.has(item));
}

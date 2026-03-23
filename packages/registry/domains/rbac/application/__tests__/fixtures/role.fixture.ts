import { Role } from "../../../domain/entities/role.entity.js";
import { Permission } from "../../../domain/entities/permission.entity.js";

export function createTestRole(
  overrides?: Partial<{
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
  }>,
): Role {
  const result = Role.create({
    id: overrides?.id ?? "test-role-1",
    name: overrides?.name ?? "editor",
    description: overrides?.description ?? "Editor role",
    permissions: overrides?.permissions ?? [],
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test role: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}

export function createTestPermission(
  overrides?: Partial<{
    id: string;
    action: string;
    resource: string;
    conditions: Record<string, unknown>;
  }>,
): Permission {
  const result = Permission.create({
    id: overrides?.id ?? "test-perm-1",
    action: overrides?.action ?? "read",
    resource: overrides?.resource ?? "posts",
    conditions: overrides?.conditions,
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test permission: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}

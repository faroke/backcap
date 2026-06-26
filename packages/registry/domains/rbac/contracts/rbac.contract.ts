import type { Result } from "../shared/result.js";
import type { PermissionDenied } from "../domain/errors/permission-denied.error.js";
import type { DuplicateRole } from "../domain/errors/duplicate-role.error.js";
import type { InvalidRoleName } from "../domain/errors/invalid-role-name.error.js";
import type { RoleNotFound } from "../domain/errors/role-not-found.error.js";

export interface RbacCreateRoleInput {
  name: string;
  description: string;
  permissions?: { action: string; resource: string; conditions?: Record<string, unknown> }[];
}

export interface RbacAssignRoleInput {
  userId: string;
  roleId: string;
  organizationId?: string;
}

export interface RbacRevokeRoleInput {
  userId: string;
  roleId: string;
}

export interface RbacCheckPermissionInput {
  userId: string;
  action: string;
  resource: string;
  organizationId?: string;
}

export interface RbacRoleOutput {
  id: string;
  name: string;
  description: string;
  permissions: { action: string; resource: string; conditions: Record<string, unknown> }[];
}

export interface RbacPermissionOutput {
  id: string;
  action: string;
  resource: string;
  conditions: Record<string, unknown>;
}

export interface IAuthorizationService {
  createRole(
    input: RbacCreateRoleInput,
  ): Promise<Result<{ roleId: string }, DuplicateRole | PermissionDenied | InvalidRoleName>>;
  assignRole(input: RbacAssignRoleInput): Promise<Result<{ event: unknown }, RoleNotFound>>;
  revokeRole(input: RbacRevokeRoleInput): Promise<Result<{ event: unknown }, RoleNotFound>>;
  checkPermission(input: RbacCheckPermissionInput): Promise<Result<boolean, PermissionDenied>>;
  listRoles(): Promise<Result<RbacRoleOutput[], never>>;
  getUserPermissions(userId: string, organizationId?: string): Promise<Result<RbacPermissionOutput[], never>>;
}

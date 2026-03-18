import type { Result } from "../shared/result.js";
import type { PermissionDenied } from "../domain/errors/permission-denied.error.js";

export interface RbacCreateRoleInput {
  name: string;
  description: string;
  permissions?: { action: string; resource: string; conditions?: Record<string, unknown> }[];
}

export interface RbacAssignRoleInput {
  userId: string;
  roleId: string;
}

export interface RbacRevokeRoleInput {
  userId: string;
  roleId: string;
}

export interface RbacCheckPermissionInput {
  userId: string;
  action: string;
  resource: string;
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
  createRole(input: RbacCreateRoleInput): Promise<Result<{ roleId: string }, Error>>;
  assignRole(input: RbacAssignRoleInput): Promise<Result<{ event: unknown }, Error>>;
  revokeRole(input: RbacRevokeRoleInput): Promise<Result<{ event: unknown }, Error>>;
  checkPermission(input: RbacCheckPermissionInput): Promise<Result<boolean, PermissionDenied>>;
  listRoles(): Promise<Result<RbacRoleOutput[], Error>>;
  getUserPermissions(userId: string): Promise<Result<RbacPermissionOutput[], Error>>;
}

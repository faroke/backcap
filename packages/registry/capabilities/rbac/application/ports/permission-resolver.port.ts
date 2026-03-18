import type { Permission } from "../../domain/entities/permission.entity.js";

export interface IPermissionResolver {
  getUserPermissions(userId: string, organizationId?: string): Promise<Permission[]>;
  hasPermission(userId: string, action: string, resource: string, organizationId?: string): Promise<boolean>;
}

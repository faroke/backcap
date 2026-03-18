import type { Permission } from "../../../domain/entities/permission.entity.js";
import type { IPermissionResolver } from "../../ports/permission-resolver.port.js";

export class InMemoryPermissionResolver implements IPermissionResolver {
  private userPermissions = new Map<string, Permission[]>();
  private orgPermissions = new Map<string, Permission[]>();

  setPermissions(userId: string, permissions: Permission[], organizationId?: string): void {
    const key = organizationId ? `${userId}:${organizationId}` : userId;
    if (organizationId) {
      this.orgPermissions.set(key, permissions);
    } else {
      this.userPermissions.set(userId, permissions);
    }
  }

  async getUserPermissions(userId: string, organizationId?: string): Promise<Permission[]> {
    if (organizationId) {
      return this.orgPermissions.get(`${userId}:${organizationId}`) ?? [];
    }
    return this.userPermissions.get(userId) ?? [];
  }

  async hasPermission(
    userId: string,
    action: string,
    resource: string,
    organizationId?: string,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, organizationId);
    return permissions.some(
      (p) =>
        (p.action.value === action || p.action.value === "manage") &&
        p.resource.value === resource,
    );
  }
}

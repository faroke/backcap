import type { Role } from "../../../domain/entities/role.entity.js";
import type { IRoleRepository } from "../../ports/role-repository.port.js";

export class InMemoryRoleRepository implements IRoleRepository {
  private store = new Map<string, Role>();
  private userRoles = new Map<string, Set<string>>();

  async findById(id: string): Promise<Role | null> {
    return this.store.get(id) ?? null;
  }

  async findByName(name: string): Promise<Role | null> {
    return [...this.store.values()].find((r) => r.name === name) ?? null;
  }

  async findByUserId(userId: string): Promise<Role[]> {
    const roleIds = this.userRoles.get(userId) ?? new Set();
    return [...roleIds]
      .map((id) => this.store.get(id))
      .filter((r): r is Role => r !== undefined);
  }

  async save(role: Role): Promise<void> {
    this.store.set(role.id, role);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async findAll(): Promise<Role[]> {
    return [...this.store.values()];
  }

  async assignToUser(userId: string, roleId: string, _organizationId?: string): Promise<void> {
    if (!this.userRoles.has(userId)) {
      this.userRoles.set(userId, new Set());
    }
    this.userRoles.get(userId)!.add(roleId);
  }

  async revokeFromUser(userId: string, roleId: string): Promise<void> {
    this.userRoles.get(userId)?.delete(roleId);
  }
}

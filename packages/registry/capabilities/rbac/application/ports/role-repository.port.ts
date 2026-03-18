import type { Role } from "../../domain/entities/role.entity.js";

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findByUserId(userId: string): Promise<Role[]>;
  save(role: Role): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Role[]>;
  assignToUser(userId: string, roleId: string): Promise<void>;
  revokeFromUser(userId: string, roleId: string): Promise<void>;
}

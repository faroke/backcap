// Template: import type { IRoleRepository } from "{{cap_rel}}/rbac/application/ports/role-repository.port.js";
import type { IRoleRepository } from "../../../capabilities/rbac/application/ports/role-repository.port.js";
// Template: import { Role } from "{{cap_rel}}/rbac/domain/entities/role.entity.js";
import { Role } from "../../../capabilities/rbac/domain/entities/role.entity.js";
// Template: import { Permission } from "{{cap_rel}}/rbac/domain/entities/permission.entity.js";
import { Permission } from "../../../capabilities/rbac/domain/entities/permission.entity.js";

interface PrismaPermissionRecord {
  id: string;
  action: string;
  resource: string;
  conditions: unknown;
  roleId: string;
  createdAt: Date;
}

interface PrismaRoleRecord {
  id: string;
  name: string;
  description: string;
  permissions: PrismaPermissionRecord[];
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaUserRoleRecord {
  id: string;
  userId: string;
  roleId: string;
  createdAt: Date;
}

interface PrismaRoleDelegate {
  findUnique(args: {
    where: { id?: string; name?: string };
    include?: { permissions?: boolean };
  }): Promise<PrismaRoleRecord | null>;
  findMany(args?: { include?: { permissions?: boolean } }): Promise<PrismaRoleRecord[]>;
  create(args: {
    data: {
      id: string;
      name: string;
      description: string;
      permissions?: { create: { id: string; action: string; resource: string; conditions: unknown }[] };
    };
    include?: { permissions?: boolean };
  }): Promise<PrismaRoleRecord>;
  update(args: {
    where: { id: string };
    data: {
      name?: string;
      description?: string;
      permissions?: { deleteMany: Record<string, never>; create: { id: string; action: string; resource: string; conditions: unknown }[] };
    };
    include?: { permissions?: boolean };
  }): Promise<PrismaRoleRecord>;
  delete(args: { where: { id: string } }): Promise<PrismaRoleRecord>;
}

interface PrismaUserRoleDelegate {
  findMany(args: { where: { userId: string }; include?: { role?: { include?: { permissions?: boolean } } } }): Promise<(PrismaUserRoleRecord & { role?: PrismaRoleRecord })[]>;
  findFirst(args: { where: { userId: string; roleId: string } }): Promise<PrismaUserRoleRecord | null>;
  create(args: { data: { userId: string; roleId: string } }): Promise<PrismaUserRoleRecord>;
  deleteMany(args: { where: { userId: string; roleId: string } }): Promise<{ count: number }>;
}

interface PrismaClient {
  role: PrismaRoleDelegate;
  userRole: PrismaUserRoleDelegate;
}

export class PrismaRoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Role | null> {
    const record = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const record = await this.prisma.role.findUnique({
      where: { name },
      include: { permissions: true },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByUserId(userId: string): Promise<Role[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: { include: { permissions: true } } },
    });
    return userRoles
      .filter((ur) => ur.role !== undefined)
      .map((ur) => this.toDomain(ur.role!));
  }

  async save(role: Role): Promise<void> {
    const existing = await this.prisma.role.findUnique({
      where: { id: role.id },
    });

    const permissionData = role.permissions.map((p) => ({
      id: p.id,
      action: p.action.value,
      resource: p.resource.value,
      conditions: p.conditions,
    }));

    if (existing) {
      await this.prisma.role.update({
        where: { id: role.id },
        data: {
          name: role.name,
          description: role.description,
          permissions: {
            deleteMany: {},
            create: permissionData,
          },
        },
        include: { permissions: true },
      });
    } else {
      await this.prisma.role.create({
        data: {
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: {
            create: permissionData,
          },
        },
        include: { permissions: true },
      });
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.role.delete({ where: { id } });
  }

  async findAll(): Promise<Role[]> {
    const records = await this.prisma.role.findMany({ include: { permissions: true } });
    return records.map((r) => this.toDomain(r));
  }

  async assignToUser(userId: string, roleId: string): Promise<void> {
    const existing = await this.prisma.userRole.findFirst({ where: { userId, roleId } });
    if (existing) return;
    await this.prisma.userRole.create({ data: { userId, roleId } });
  }

  async revokeFromUser(userId: string, roleId: string): Promise<void> {
    await this.prisma.userRole.deleteMany({ where: { userId, roleId } });
  }

  private toDomain(record: PrismaRoleRecord): Role {
    const permissions = record.permissions.map((p) => {
      const result = Permission.create({
        id: p.id,
        action: p.action,
        resource: p.resource,
        conditions: (p.conditions as Record<string, unknown>) ?? {},
        createdAt: p.createdAt,
      });
      return result.unwrap();
    });

    const result = Role.create({
      id: record.id,
      name: record.name,
      description: record.description,
      permissions,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
    return result.unwrap();
  }
}

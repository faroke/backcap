import { describe, it, expect, beforeEach, vi } from "vitest";
import { PrismaRoleRepository } from "../prisma-role-repository.adapter.js";
import { Role } from "../../../../capabilities/rbac/domain/entities/role.entity.js";
import { Permission } from "../../../../capabilities/rbac/domain/entities/permission.entity.js";

function createMockPrisma() {
  return {
    role: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    userRole: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  };
}

const dbRoleRecord = {
  id: "role-1",
  name: "admin",
  description: "Administrator",
  permissions: [
    {
      id: "perm-1",
      action: "manage",
      resource: "posts",
      conditions: {},
      roleId: "role-1",
      createdAt: new Date("2024-01-01"),
    },
  ],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("PrismaRoleRepository", () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repo: PrismaRoleRepository;

  beforeEach(() => {
    prisma = createMockPrisma();
    repo = new PrismaRoleRepository(prisma);
  });

  it("findById returns role when found", async () => {
    prisma.role.findUnique.mockResolvedValue(dbRoleRecord);
    const role = await repo.findById("role-1");
    expect(role).not.toBeNull();
    expect(role!.name).toBe("admin");
    expect(role!.permissions).toHaveLength(1);
    expect(prisma.role.findUnique).toHaveBeenCalledWith({
      where: { id: "role-1" },
      include: { permissions: true },
    });
  });

  it("findById returns null when not found", async () => {
    prisma.role.findUnique.mockResolvedValue(null);
    const role = await repo.findById("nonexistent");
    expect(role).toBeNull();
  });

  it("findByName returns role when found", async () => {
    prisma.role.findUnique.mockResolvedValue(dbRoleRecord);
    const role = await repo.findByName("admin");
    expect(role).not.toBeNull();
    expect(role!.id).toBe("role-1");
  });

  it("save creates new role with permissions", async () => {
    prisma.role.findUnique.mockResolvedValue(null);
    prisma.role.create.mockResolvedValue(dbRoleRecord);
    const perm = Permission.create({ id: "p1", action: "read", resource: "posts" }).unwrap();
    const role = Role.create({ id: "r1", name: "editor", description: "Editor", permissions: [perm] }).unwrap();

    await repo.save(role);
    expect(prisma.role.create).toHaveBeenCalledOnce();
    const data = prisma.role.create.mock.calls[0]![0].data;
    expect(data.name).toBe("editor");
    expect(data.permissions.create).toHaveLength(1);
  });

  it("save updates existing role", async () => {
    prisma.role.findUnique.mockResolvedValue(dbRoleRecord);
    prisma.role.update.mockResolvedValue(dbRoleRecord);
    const role = Role.create({ id: "role-1", name: "admin", description: "Updated" }).unwrap();

    await repo.save(role);
    expect(prisma.role.update).toHaveBeenCalledOnce();
    expect(prisma.role.create).not.toHaveBeenCalled();
  });

  it("findAll returns all roles", async () => {
    prisma.role.findMany.mockResolvedValue([dbRoleRecord]);
    const roles = await repo.findAll();
    expect(roles).toHaveLength(1);
    expect(roles[0]!.name).toBe("admin");
  });

  it("assignToUser creates user-role association", async () => {
    prisma.userRole.findFirst.mockResolvedValue(null);
    prisma.userRole.create.mockResolvedValue({});
    await repo.assignToUser("user-1", "role-1");
    expect(prisma.userRole.create).toHaveBeenCalledWith({
      data: { userId: "user-1", roleId: "role-1" },
    });
  });

  it("assignToUser is idempotent when assignment already exists", async () => {
    prisma.userRole.findFirst.mockResolvedValue({ id: "ur-1", userId: "user-1", roleId: "role-1", createdAt: new Date() });
    await repo.assignToUser("user-1", "role-1");
    expect(prisma.userRole.create).not.toHaveBeenCalled();
  });

  it("revokeFromUser deletes user-role association", async () => {
    prisma.userRole.deleteMany.mockResolvedValue({ count: 1 });
    await repo.revokeFromUser("user-1", "role-1");
    expect(prisma.userRole.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user-1", roleId: "role-1" },
    });
  });

  it("findByUserId returns roles for user", async () => {
    prisma.userRole.findMany.mockResolvedValue([
      { id: "ur-1", userId: "user-1", roleId: "role-1", createdAt: new Date(), role: dbRoleRecord },
    ]);
    const roles = await repo.findByUserId("user-1");
    expect(roles).toHaveLength(1);
    expect(roles[0]!.name).toBe("admin");
  });

  it("delete removes role", async () => {
    prisma.role.delete.mockResolvedValue(dbRoleRecord);
    await repo.delete("role-1");
    expect(prisma.role.delete).toHaveBeenCalledWith({ where: { id: "role-1" } });
  });
});

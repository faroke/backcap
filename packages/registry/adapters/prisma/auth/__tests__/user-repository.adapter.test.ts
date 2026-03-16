import { describe, it, expect, beforeEach, vi } from "vitest";
import { PrismaUserRepository } from "../user-repository.adapter.js";
import { User } from "../../../../capabilities/auth/domain/entities/user.entity.js";

function createMockPrisma() {
  return {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };
}

const dbRecord = {
  id: "user-1",
  email: "test@example.com",
  passwordHash: "hashed",
  roles: ["user"],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("PrismaUserRepository", () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repo: PrismaUserRepository;

  beforeEach(() => {
    prisma = createMockPrisma();
    repo = new PrismaUserRepository(prisma);
  });

  it("findByEmail returns user when found", async () => {
    prisma.user.findUnique.mockResolvedValue(dbRecord);
    const user = await repo.findByEmail("test@example.com");
    expect(user).not.toBeNull();
    expect(user!.email.value).toBe("test@example.com");
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "test@example.com" } });
  });

  it("findByEmail returns null when not found", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const user = await repo.findByEmail("missing@example.com");
    expect(user).toBeNull();
  });

  it("findById returns user when found", async () => {
    prisma.user.findUnique.mockResolvedValue(dbRecord);
    const user = await repo.findById("user-1");
    expect(user).not.toBeNull();
    expect(user!.id).toBe("user-1");
  });

  it("save persists user via prisma.user.create", async () => {
    prisma.user.create.mockResolvedValue(dbRecord);
    const user = User.create({
      id: "user-1",
      email: "test@example.com",
      passwordHash: "hashed",
    }).unwrap();

    await repo.save(user);
    expect(prisma.user.create).toHaveBeenCalledOnce();
    const data = prisma.user.create.mock.calls[0]![0].data;
    expect(data.email).toBe("test@example.com");
    expect(data.id).toBe("user-1");
  });
});

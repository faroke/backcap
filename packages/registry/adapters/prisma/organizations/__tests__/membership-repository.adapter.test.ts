import { describe, it, expect, beforeEach, vi } from "vitest";
import { PrismaMembershipRepository } from "../membership-repository.adapter.js";
import { Membership } from "../../../../capabilities/organizations/domain/entities/membership.entity.js";

function createMockPrisma() {
  return {
    membership: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  };
}

const memberRecord = {
  id: "mem-1",
  userId: "user-1",
  organizationId: "org-1",
  role: "member",
  joinedAt: new Date("2024-01-01"),
};

describe("PrismaMembershipRepository", () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repo: PrismaMembershipRepository;

  beforeEach(() => {
    prisma = createMockPrisma();
    repo = new PrismaMembershipRepository(prisma);
  });

  it("findById returns membership when found", async () => {
    prisma.membership.findUnique.mockResolvedValue(memberRecord);

    const result = await repo.findById("mem-1");
    expect(result).not.toBeNull();
    expect(result!.userId).toBe("user-1");
    expect(result!.role.value).toBe("member");
  });

  it("findByUserAndOrg returns membership when found", async () => {
    prisma.membership.findFirst.mockResolvedValue(memberRecord);

    const result = await repo.findByUserAndOrg("user-1", "org-1");
    expect(result).not.toBeNull();
    expect(prisma.membership.findFirst).toHaveBeenCalledWith({
      where: { userId: "user-1", organizationId: "org-1" },
    });
  });

  it("findByOrganization returns all members", async () => {
    prisma.membership.findMany.mockResolvedValue([memberRecord]);

    const result = await repo.findByOrganization("org-1");
    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe("user-1");
  });

  it("save upserts membership record", async () => {
    prisma.membership.upsert.mockResolvedValue(memberRecord);
    const membership = Membership.create({
      id: "mem-1",
      userId: "user-1",
      organizationId: "org-1",
      role: "member",
    }).unwrap();

    await repo.save(membership);
    expect(prisma.membership.upsert).toHaveBeenCalledWith({
      where: { id: "mem-1" },
      create: expect.objectContaining({
        id: "mem-1",
        userId: "user-1",
        role: "member",
      }),
      update: expect.objectContaining({
        id: "mem-1",
        userId: "user-1",
        role: "member",
      }),
    });
  });

  it("delete removes membership", async () => {
    prisma.membership.delete.mockResolvedValue(memberRecord);

    await repo.delete("mem-1");
    expect(prisma.membership.delete).toHaveBeenCalledWith({ where: { id: "mem-1" } });
  });
});

import { describe, it, expect, beforeEach, vi } from "vitest";
import { PrismaOrganizationRepository } from "../organization-repository.adapter.js";
import { Organization } from "../../../../capabilities/organizations/domain/entities/organization.entity.js";

function createMockPrisma() {
  return {
    organization: {
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

const orgRecord = {
  id: "org-1",
  name: "Test Org",
  slug: "test-org",
  plan: "free",
  settings: {},
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("PrismaOrganizationRepository", () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repo: PrismaOrganizationRepository;

  beforeEach(() => {
    prisma = createMockPrisma();
    repo = new PrismaOrganizationRepository(prisma);
  });

  it("findById returns organization when found", async () => {
    prisma.organization.findUnique.mockResolvedValue(orgRecord);

    const result = await repo.findById("org-1");
    expect(result).not.toBeNull();
    expect(result!.id).toBe("org-1");
    expect(result!.name).toBe("Test Org");
    expect(result!.slug.value).toBe("test-org");
    expect(prisma.organization.findUnique).toHaveBeenCalledWith({ where: { id: "org-1" } });
  });

  it("findById returns null when not found", async () => {
    prisma.organization.findUnique.mockResolvedValue(null);

    const result = await repo.findById("non-existent");
    expect(result).toBeNull();
  });

  it("findBySlug returns organization when found", async () => {
    prisma.organization.findUnique.mockResolvedValue(orgRecord);

    const result = await repo.findBySlug("test-org");
    expect(result).not.toBeNull();
    expect(result!.slug.value).toBe("test-org");
    expect(prisma.organization.findUnique).toHaveBeenCalledWith({ where: { slug: "test-org" } });
  });

  it("save upserts organization record", async () => {
    prisma.organization.upsert.mockResolvedValue(orgRecord);
    const org = Organization.create({
      id: "org-1",
      name: "Test Org",
      slug: "test-org",
    }).unwrap();

    await repo.save(org);
    expect(prisma.organization.upsert).toHaveBeenCalledWith({
      where: { id: "org-1" },
      create: expect.objectContaining({
        id: "org-1",
        name: "Test Org",
        slug: "test-org",
      }),
      update: expect.objectContaining({
        id: "org-1",
        name: "Test Org",
        slug: "test-org",
      }),
    });
  });

  it("delete removes organization", async () => {
    prisma.organization.delete.mockResolvedValue(orgRecord);

    await repo.delete("org-1");
    expect(prisma.organization.delete).toHaveBeenCalledWith({ where: { id: "org-1" } });
  });
});

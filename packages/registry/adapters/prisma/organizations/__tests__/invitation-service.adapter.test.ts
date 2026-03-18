import { describe, it, expect, beforeEach, vi } from "vitest";
import { PrismaInvitationService } from "../invitation-service.adapter.js";

function createMockPrisma() {
  return {
    invitation: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };
}

const invitationRecord = {
  id: "inv-1",
  organizationId: "org-1",
  email: "user@example.com",
  role: "member",
  invitedBy: "owner-1",
  token: "token-abc",
  expiresAt: new Date("2024-01-08"),
  acceptedAt: null,
};

describe("PrismaInvitationService", () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let service: PrismaInvitationService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new PrismaInvitationService(prisma);
  });

  it("creates an invitation", async () => {
    prisma.invitation.create.mockResolvedValue(invitationRecord);

    const result = await service.create({
      organizationId: "org-1",
      email: "user@example.com",
      role: "member",
      invitedBy: "owner-1",
    });

    expect(result.id).toBeDefined();
    expect(result.email).toBe("user@example.com");
    expect(result.token).toBeDefined();
    expect(prisma.invitation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: "org-1",
        email: "user@example.com",
        role: "member",
        invitedBy: "owner-1",
      }),
    });
  });

  it("findByToken returns invitation when found", async () => {
    prisma.invitation.findUnique.mockResolvedValue(invitationRecord);

    const result = await service.findByToken("token-abc");
    expect(result).not.toBeNull();
    expect(result!.token).toBe("token-abc");
    expect(prisma.invitation.findUnique).toHaveBeenCalledWith({
      where: { token: "token-abc" },
    });
  });

  it("findByToken returns null when not found", async () => {
    prisma.invitation.findUnique.mockResolvedValue(null);

    const result = await service.findByToken("non-existent");
    expect(result).toBeNull();
  });

  it("markAccepted updates the invitation", async () => {
    prisma.invitation.update.mockResolvedValue({
      ...invitationRecord,
      acceptedAt: new Date(),
    });

    await service.markAccepted("inv-1");
    expect(prisma.invitation.update).toHaveBeenCalledWith({
      where: { id: "inv-1" },
      data: { acceptedAt: expect.any(Date) },
    });
  });
});

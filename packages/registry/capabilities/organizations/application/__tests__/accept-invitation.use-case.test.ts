import { describe, it, expect, beforeEach } from "vitest";
import { AcceptInvitation } from "../use-cases/accept-invitation.use-case.js";
import { InMemoryMembershipRepository } from "./mocks/membership-repository.mock.js";
import { InMemoryInvitationService } from "./mocks/invitation-service.mock.js";
import { createTestMembership } from "./fixtures/membership.fixture.js";
import { MemberAlreadyExists } from "../../domain/errors/member-already-exists.error.js";
import type { Invitation } from "../ports/invitation-service.port.js";

describe("AcceptInvitation use case", () => {
  let membershipRepo: InMemoryMembershipRepository;
  let invitationService: InMemoryInvitationService;
  let acceptInvitation: AcceptInvitation;

  const validInvitation: Invitation = {
    id: "inv-1",
    organizationId: "org-1",
    email: "new@example.com",
    role: "member",
    invitedBy: "user-1",
    token: "valid-token",
    expiresAt: new Date(Date.now() + 86400000), // tomorrow
    acceptedAt: null,
  };

  beforeEach(() => {
    membershipRepo = new InMemoryMembershipRepository();
    invitationService = new InMemoryInvitationService();
    acceptInvitation = new AcceptInvitation(membershipRepo, invitationService);

    invitationService.seed(validInvitation);
  });

  it("accepts a valid invitation and creates membership", async () => {
    const result = await acceptInvitation.execute({
      token: "valid-token",
      userId: "user-2",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.membershipId).toBeDefined();
    expect(output.event.userId).toBe("user-2");
    expect(output.event.role).toBe("member");

    // Verify membership persisted
    const membership = await membershipRepo.findByUserAndOrg("user-2", "org-1");
    expect(membership).not.toBeNull();
    expect(membership!.role.value).toBe("member");
  });

  it("rejects invalid token", async () => {
    const result = await acceptInvitation.execute({
      token: "invalid-token",
      userId: "user-2",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("not found");
  });

  it("rejects already accepted invitation", async () => {
    invitationService.seed({
      ...validInvitation,
      id: "inv-2",
      token: "accepted-token",
      acceptedAt: new Date(),
    });

    const result = await acceptInvitation.execute({
      token: "accepted-token",
      userId: "user-2",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("already been accepted");
  });

  it("rejects expired invitation", async () => {
    invitationService.seed({
      ...validInvitation,
      id: "inv-3",
      token: "expired-token",
      expiresAt: new Date(Date.now() - 86400000), // yesterday
    });

    const result = await acceptInvitation.execute({
      token: "expired-token",
      userId: "user-2",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("expired");
  });

  it("rejects if user is already a member", async () => {
    const existing = createTestMembership({
      userId: "user-2",
      organizationId: "org-1",
    });
    await membershipRepo.save(existing);

    const result = await acceptInvitation.execute({
      token: "valid-token",
      userId: "user-2",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(MemberAlreadyExists);
  });
});

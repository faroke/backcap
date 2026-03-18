import { describe, it, expect, beforeEach } from "vitest";
import { InviteMember } from "../use-cases/invite-member.use-case.js";
import { InMemoryOrganizationRepository } from "./mocks/organization-repository.mock.js";
import { InMemoryInvitationService } from "./mocks/invitation-service.mock.js";
import { createTestOrganization } from "./fixtures/organization.fixture.js";
import { OrgNotFound } from "../../domain/errors/org-not-found.error.js";

describe("InviteMember use case", () => {
  let orgRepo: InMemoryOrganizationRepository;
  let invitationService: InMemoryInvitationService;
  let inviteMember: InviteMember;

  beforeEach(async () => {
    orgRepo = new InMemoryOrganizationRepository();
    invitationService = new InMemoryInvitationService();
    inviteMember = new InviteMember(orgRepo, invitationService);

    const org = createTestOrganization();
    await orgRepo.save(org);
  });

  it("creates an invitation successfully", async () => {
    const result = await inviteMember.execute({
      organizationId: "test-org-1",
      email: "invite@example.com",
      role: "member",
      invitedBy: "user-1",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.invitationId).toBeDefined();
    expect(output.event.invitedEmail).toBe("invite@example.com");
    expect(output.event.role).toBe("member");
  });

  it("rejects invitation for non-existent org", async () => {
    const result = await inviteMember.execute({
      organizationId: "non-existent",
      email: "invite@example.com",
      role: "member",
      invitedBy: "user-1",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(OrgNotFound);
  });

  it("rejects owner role invitation", async () => {
    const result = await inviteMember.execute({
      organizationId: "test-org-1",
      email: "invite@example.com",
      role: "owner",
      invitedBy: "user-1",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("owner");
  });

  it("rejects invalid role", async () => {
    const result = await inviteMember.execute({
      organizationId: "test-org-1",
      email: "invite@example.com",
      role: "superadmin",
      invitedBy: "user-1",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("superadmin");
  });
});

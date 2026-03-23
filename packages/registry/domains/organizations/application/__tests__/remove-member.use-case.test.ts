import { describe, it, expect, beforeEach } from "vitest";
import { RemoveMember } from "../use-cases/remove-member.use-case.js";
import { InMemoryOrganizationRepository } from "./mocks/organization-repository.mock.js";
import { InMemoryMembershipRepository } from "./mocks/membership-repository.mock.js";
import { createTestOrganization } from "./fixtures/organization.fixture.js";
import { createTestMembership } from "./fixtures/membership.fixture.js";
import { OrgNotFound } from "../../domain/errors/org-not-found.error.js";
import { CannotRemoveOwner } from "../../domain/errors/cannot-remove-owner.error.js";

describe("RemoveMember use case", () => {
  let orgRepo: InMemoryOrganizationRepository;
  let membershipRepo: InMemoryMembershipRepository;
  let removeMember: RemoveMember;

  beforeEach(async () => {
    orgRepo = new InMemoryOrganizationRepository();
    membershipRepo = new InMemoryMembershipRepository();
    removeMember = new RemoveMember(orgRepo, membershipRepo);

    const org = createTestOrganization();
    await orgRepo.save(org);

    const membership = createTestMembership({ userId: "user-2", role: "member" });
    await membershipRepo.save(membership);
  });

  it("removes a member successfully", async () => {
    const result = await removeMember.execute({
      organizationId: "test-org-1",
      userId: "user-2",
      removedBy: "user-1",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().event.userId).toBe("user-2");
    expect(result.unwrap().event.removedBy).toBe("user-1");

    // Verify member removed
    const membership = await membershipRepo.findByUserAndOrg("user-2", "test-org-1");
    expect(membership).toBeNull();
  });

  it("rejects removal from non-existent org", async () => {
    const result = await removeMember.execute({
      organizationId: "non-existent",
      userId: "user-2",
      removedBy: "user-1",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(OrgNotFound);
  });

  it("rejects removal of non-member", async () => {
    const result = await removeMember.execute({
      organizationId: "test-org-1",
      userId: "user-999",
      removedBy: "user-1",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("not a member");
  });

  it("cannot remove the owner", async () => {
    const ownerMembership = createTestMembership({
      id: "mem-owner",
      userId: "owner-user",
      role: "owner",
    });
    await membershipRepo.save(ownerMembership);

    const result = await removeMember.execute({
      organizationId: "test-org-1",
      userId: "owner-user",
      removedBy: "admin-user",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(CannotRemoveOwner);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { ListMembers } from "../use-cases/list-members.use-case.js";
import { InMemoryOrganizationRepository } from "./mocks/organization-repository.mock.js";
import { InMemoryMembershipRepository } from "./mocks/membership-repository.mock.js";
import { createTestOrganization } from "./fixtures/organization.fixture.js";
import { createTestMembership } from "./fixtures/membership.fixture.js";
import { OrgNotFound } from "../../domain/errors/org-not-found.error.js";

describe("ListMembers use case", () => {
  let orgRepo: InMemoryOrganizationRepository;
  let membershipRepo: InMemoryMembershipRepository;
  let listMembers: ListMembers;

  beforeEach(async () => {
    orgRepo = new InMemoryOrganizationRepository();
    membershipRepo = new InMemoryMembershipRepository();
    listMembers = new ListMembers(orgRepo, membershipRepo);

    const org = createTestOrganization();
    await orgRepo.save(org);
  });

  it("lists members of an organization", async () => {
    const m1 = createTestMembership({ id: "mem-1", userId: "user-1", role: "owner" });
    const m2 = createTestMembership({ id: "mem-2", userId: "user-2", role: "member" });
    await membershipRepo.save(m1);
    await membershipRepo.save(m2);

    const result = await listMembers.execute("test-org-1");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toHaveLength(2);
  });

  it("returns empty array for org with no members", async () => {
    const result = await listMembers.execute("test-org-1");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toHaveLength(0);
  });

  it("fails for non-existent organization", async () => {
    const result = await listMembers.execute("non-existent");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(OrgNotFound);
  });
});

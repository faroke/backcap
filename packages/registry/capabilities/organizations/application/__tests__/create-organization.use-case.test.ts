import { describe, it, expect, beforeEach } from "vitest";
import { CreateOrganization } from "../use-cases/create-organization.use-case.js";
import { InMemoryOrganizationRepository } from "./mocks/organization-repository.mock.js";
import { InMemoryMembershipRepository } from "./mocks/membership-repository.mock.js";
import { createTestOrganization } from "./fixtures/organization.fixture.js";
import { OrgSlugTaken } from "../../domain/errors/org-slug-taken.error.js";

describe("CreateOrganization use case", () => {
  let orgRepo: InMemoryOrganizationRepository;
  let membershipRepo: InMemoryMembershipRepository;
  let createOrg: CreateOrganization;

  beforeEach(() => {
    orgRepo = new InMemoryOrganizationRepository();
    membershipRepo = new InMemoryMembershipRepository();
    createOrg = new CreateOrganization(orgRepo, membershipRepo);
  });

  it("creates a new organization with owner membership", async () => {
    const result = await createOrg.execute({
      name: "My Org",
      slug: "my-org",
      ownerId: "user-1",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.organizationId).toBeDefined();
    expect(output.event.name).toBe("My Org");
    expect(output.event.slug).toBe("my-org");
    expect(output.event.ownerId).toBe("user-1");

    // Verify org was persisted
    const saved = await orgRepo.findBySlug("my-org");
    expect(saved).not.toBeNull();
    expect(saved!.name).toBe("My Org");

    // Verify owner membership was created
    const memberships = await membershipRepo.findByOrganization(output.organizationId);
    expect(memberships).toHaveLength(1);
    expect(memberships[0].userId).toBe("user-1");
    expect(memberships[0].role.isOwner()).toBe(true);
  });

  it("rejects duplicate slug", async () => {
    const existing = createTestOrganization({ slug: "taken-slug" });
    await orgRepo.save(existing);

    const result = await createOrg.execute({
      name: "Another Org",
      slug: "taken-slug",
      ownerId: "user-2",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(OrgSlugTaken);
  });

  it("rejects empty name", async () => {
    const result = await createOrg.execute({
      name: "",
      slug: "valid-slug",
      ownerId: "user-1",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("name");
  });

  it("rejects invalid slug", async () => {
    const result = await createOrg.execute({
      name: "My Org",
      slug: "-invalid",
      ownerId: "user-1",
    });

    expect(result.isFail()).toBe(true);
  });

  it("creates with custom plan", async () => {
    const result = await createOrg.execute({
      name: "Pro Org",
      slug: "pro-org",
      ownerId: "user-1",
      plan: "pro",
    });

    expect(result.isOk()).toBe(true);
    const saved = await orgRepo.findBySlug("pro-org");
    expect(saved!.plan).toBe("pro");
  });
});

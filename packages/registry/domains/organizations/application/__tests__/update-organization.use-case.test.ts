import { describe, it, expect, beforeEach } from "vitest";
import { UpdateOrganization } from "../use-cases/update-organization.use-case.js";
import { InMemoryOrganizationRepository } from "./mocks/organization-repository.mock.js";
import { createTestOrganization } from "./fixtures/organization.fixture.js";
import { OrgNotFound } from "../../domain/errors/org-not-found.error.js";

describe("UpdateOrganization use case", () => {
  let orgRepo: InMemoryOrganizationRepository;
  let updateOrg: UpdateOrganization;

  beforeEach(async () => {
    orgRepo = new InMemoryOrganizationRepository();
    updateOrg = new UpdateOrganization(orgRepo);

    const org = createTestOrganization();
    await orgRepo.save(org);
  });

  it("updates organization name", async () => {
    const result = await updateOrg.execute({
      organizationId: "test-org-1",
      name: "Updated Name",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().name).toBe("Updated Name");

    // Verify persisted
    const saved = await orgRepo.findById("test-org-1");
    expect(saved!.name).toBe("Updated Name");
  });

  it("updates organization settings", async () => {
    const result = await updateOrg.execute({
      organizationId: "test-org-1",
      settings: { theme: "dark" },
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().settings).toEqual({ theme: "dark" });
  });

  it("updates both name and settings", async () => {
    const result = await updateOrg.execute({
      organizationId: "test-org-1",
      name: "New Name",
      settings: { locale: "fr" },
    });

    expect(result.isOk()).toBe(true);
    const org = result.unwrap();
    expect(org.name).toBe("New Name");
    expect(org.settings).toEqual({ locale: "fr" });
  });

  it("fails for non-existent organization", async () => {
    const result = await updateOrg.execute({
      organizationId: "non-existent",
      name: "New Name",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(OrgNotFound);
  });

  it("rejects empty name", async () => {
    const result = await updateOrg.execute({
      organizationId: "test-org-1",
      name: "",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("name");
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { GetOrganization } from "../use-cases/get-organization.use-case.js";
import { InMemoryOrganizationRepository } from "./mocks/organization-repository.mock.js";
import { createTestOrganization } from "./fixtures/organization.fixture.js";
import { OrgNotFound } from "../../domain/errors/org-not-found.error.js";

describe("GetOrganization use case", () => {
  let orgRepo: InMemoryOrganizationRepository;
  let getOrg: GetOrganization;

  beforeEach(async () => {
    orgRepo = new InMemoryOrganizationRepository();
    getOrg = new GetOrganization(orgRepo);

    const org = createTestOrganization();
    await orgRepo.save(org);
  });

  it("returns organization by id", async () => {
    const result = await getOrg.execute("test-org-1");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().name).toBe("Test Organization");
    expect(result.unwrap().slug.value).toBe("test-org");
  });

  it("fails for non-existent organization", async () => {
    const result = await getOrg.execute("non-existent");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(OrgNotFound);
  });
});

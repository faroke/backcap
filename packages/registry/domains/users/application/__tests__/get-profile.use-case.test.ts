import { describe, it, expect, beforeEach } from "vitest";
import { GetProfile } from "../use-cases/get-profile.use-case.js";
import { InMemoryProfileRepository } from "./mocks/profile-repository.mock.js";
import { createTestProfile } from "./fixtures/profile.fixture.js";

describe("GetProfile", () => {
  let repository: InMemoryProfileRepository;
  let useCase: GetProfile;

  beforeEach(() => {
    repository = new InMemoryProfileRepository();
    useCase = new GetProfile(repository);
  });

  it("should return existing profile", async () => {
    const profile = createTestProfile({ userId: "user-123" });
    await repository.save(profile);

    const result = await useCase.execute("user-123");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().userId).toBe("user-123");
  });

  it("should return ProfileNotFound for unknown userId", async () => {
    const result = await useCase.execute("unknown");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("ProfileNotFound");
  });
});

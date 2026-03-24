import { describe, it, expect, beforeEach } from "vitest";
import { CreateProfile } from "../use-cases/create-profile.use-case.js";
import { InMemoryProfileRepository } from "./mocks/profile-repository.mock.js";
import { createTestProfile } from "./fixtures/profile.fixture.js";

describe("CreateProfile", () => {
  let repository: InMemoryProfileRepository;
  let useCase: CreateProfile;

  beforeEach(() => {
    repository = new InMemoryProfileRepository();
    useCase = new CreateProfile(repository);
  });

  it("should create a profile successfully", async () => {
    const result = await useCase.execute({
      userId: "user-123",
      displayName: "Jane Doe",
    });

    expect(result.isOk()).toBe(true);
    const { profileId, event } = result.unwrap();
    expect(profileId).toBeDefined();
    expect(event.userId).toBe("user-123");
    expect(event.displayName).toBe("Jane Doe");
    expect(event.profileId).toBe(profileId);
  });

  it("should reject duplicate userId", async () => {
    const existing = createTestProfile({ userId: "user-123" });
    await repository.save(existing);

    const result = await useCase.execute({
      userId: "user-123",
      displayName: "Jane",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("already exists");
  });

  it("should reject invalid display name", async () => {
    const result = await useCase.execute({
      userId: "user-456",
      displayName: "",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidDisplayName");
  });

  it("should reject invalid avatar URL", async () => {
    const result = await useCase.execute({
      userId: "user-789",
      displayName: "Jane",
      avatarUrl: "not-a-url",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidAvatarUrl");
  });
});

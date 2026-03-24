import { describe, it, expect, beforeEach } from "vitest";
import { UpdateProfile } from "../use-cases/update-profile.use-case.js";
import { InMemoryProfileRepository } from "./mocks/profile-repository.mock.js";
import { createTestProfile } from "./fixtures/profile.fixture.js";

describe("UpdateProfile", () => {
  let repository: InMemoryProfileRepository;
  let useCase: UpdateProfile;

  beforeEach(() => {
    repository = new InMemoryProfileRepository();
    useCase = new UpdateProfile(repository);
  });

  it("should update display name only", async () => {
    const profile = createTestProfile({ userId: "user-1" });
    await repository.save(profile);

    const result = await useCase.execute({
      userId: "user-1",
      displayName: "New Name",
    });

    expect(result.isOk()).toBe(true);
    const { profile: updated, event } = result.unwrap();
    expect(updated.displayName.value).toBe("New Name");
    expect(event.updatedFields).toEqual(["displayName"]);
  });

  it("should update avatar only", async () => {
    const profile = createTestProfile({ userId: "user-1" });
    await repository.save(profile);

    const result = await useCase.execute({
      userId: "user-1",
      avatarUrl: "https://example.com/new.png",
    });

    expect(result.isOk()).toBe(true);
    const { profile: updated, event } = result.unwrap();
    expect(updated.avatarUrl?.value).toBe("https://example.com/new.png");
    expect(event.updatedFields).toEqual(["avatarUrl"]);
  });

  it("should update bio only", async () => {
    const profile = createTestProfile({ userId: "user-1" });
    await repository.save(profile);

    const result = await useCase.execute({
      userId: "user-1",
      bio: "New bio",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().profile.bio).toBe("New bio");
    expect(result.unwrap().event.updatedFields).toEqual(["bio"]);
  });

  it("should update multiple fields", async () => {
    const profile = createTestProfile({ userId: "user-1" });
    await repository.save(profile);

    const result = await useCase.execute({
      userId: "user-1",
      displayName: "New Name",
      bio: "New bio",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().event.updatedFields).toEqual([
      "displayName",
      "bio",
    ]);
  });

  it("should clear avatar with null", async () => {
    const profile = createTestProfile({
      userId: "user-1",
      avatarUrl: "https://example.com/img.png",
    });
    await repository.save(profile);

    const result = await useCase.execute({
      userId: "user-1",
      avatarUrl: null,
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().profile.avatarUrl).toBeNull();
  });

  it("should reject invalid display name", async () => {
    const profile = createTestProfile({ userId: "user-1" });
    await repository.save(profile);

    const result = await useCase.execute({
      userId: "user-1",
      displayName: "",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidDisplayName");
  });

  it("should reject ProfileNotFound", async () => {
    const result = await useCase.execute({
      userId: "unknown",
      displayName: "Name",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("ProfileNotFound");
  });
});

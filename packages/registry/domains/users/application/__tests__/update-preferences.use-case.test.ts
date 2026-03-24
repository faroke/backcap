import { describe, it, expect, beforeEach } from "vitest";
import { UpdatePreferences } from "../use-cases/update-preferences.use-case.js";
import { InMemoryProfileRepository } from "./mocks/profile-repository.mock.js";
import { createTestProfile } from "./fixtures/profile.fixture.js";

describe("UpdatePreferences", () => {
  let repository: InMemoryProfileRepository;
  let useCase: UpdatePreferences;

  beforeEach(() => {
    repository = new InMemoryProfileRepository();
    useCase = new UpdatePreferences(repository);
  });

  it("should update locale only", async () => {
    const profile = createTestProfile({ userId: "user-1" });
    await repository.save(profile);

    const result = await useCase.execute({
      userId: "user-1",
      locale: "fr-FR",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().profile.locale.value).toBe("fr-FR");
  });

  it("should update timezone only", async () => {
    const profile = createTestProfile({ userId: "user-1" });
    await repository.save(profile);

    const result = await useCase.execute({
      userId: "user-1",
      timezone: "Europe/Paris",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().profile.timezone.value).toBe("Europe/Paris");
  });

  it("should update both locale and timezone", async () => {
    const profile = createTestProfile({ userId: "user-1" });
    await repository.save(profile);

    const result = await useCase.execute({
      userId: "user-1",
      locale: "fr-FR",
      timezone: "Europe/Paris",
    });

    expect(result.isOk()).toBe(true);
    const { profile: updated } = result.unwrap();
    expect(updated.locale.value).toBe("fr-FR");
    expect(updated.timezone.value).toBe("Europe/Paris");
  });

  it("should reject invalid locale", async () => {
    const profile = createTestProfile({ userId: "user-1" });
    await repository.save(profile);

    const result = await useCase.execute({
      userId: "user-1",
      locale: "!!!",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidLocale");
  });

  it("should reject invalid timezone", async () => {
    const profile = createTestProfile({ userId: "user-1" });
    await repository.save(profile);

    const result = await useCase.execute({
      userId: "user-1",
      timezone: "Not/A_Real_Zone",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidTimezone");
  });

  it("should reject ProfileNotFound", async () => {
    const result = await useCase.execute({
      userId: "unknown",
      locale: "en",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("ProfileNotFound");
  });
});

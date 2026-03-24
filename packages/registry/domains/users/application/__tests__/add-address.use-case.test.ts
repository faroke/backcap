import { describe, it, expect, beforeEach } from "vitest";
import { AddAddress } from "../use-cases/add-address.use-case.js";
import { InMemoryProfileRepository } from "./mocks/profile-repository.mock.js";
import { createTestProfile } from "./fixtures/profile.fixture.js";

describe("AddAddress", () => {
  let repository: InMemoryProfileRepository;
  let useCase: AddAddress;

  beforeEach(() => {
    repository = new InMemoryProfileRepository();
    useCase = new AddAddress(repository);
  });

  it("should add address successfully", async () => {
    const profile = createTestProfile({ userId: "user-1" });
    await repository.save(profile);

    const result = await useCase.execute({
      userId: "user-1",
      label: "Home",
      street: "123 Main St",
      city: "Paris",
      postalCode: "75001",
      country: "FR",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().addresses).toHaveLength(1);
    expect(result.unwrap().addresses[0].label).toBe("Home");
  });

  it("should reject duplicate label (case-insensitive)", async () => {
    const profile = createTestProfile({ userId: "user-1" });
    await repository.save(profile);

    await useCase.execute({
      userId: "user-1",
      label: "Home",
      street: "123 Main St",
      city: "Paris",
      postalCode: "75001",
      country: "FR",
    });

    const result = await useCase.execute({
      userId: "user-1",
      label: "home",
      street: "456 Other St",
      city: "Lyon",
      postalCode: "69001",
      country: "FR",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("already exists");
  });

  it("should reject invalid address (empty street)", async () => {
    const profile = createTestProfile({ userId: "user-1" });
    await repository.save(profile);

    const result = await useCase.execute({
      userId: "user-1",
      label: "Home",
      street: "",
      city: "Paris",
      postalCode: "75001",
      country: "FR",
    });

    expect(result.isFail()).toBe(true);
  });

  it("should reject when at max 10 addresses", async () => {
    const profile = createTestProfile({ userId: "user-1" });
    await repository.save(profile);

    for (let i = 0; i < 10; i++) {
      await useCase.execute({
        userId: "user-1",
        label: `Addr${i}`,
        street: "St",
        city: "City",
        postalCode: "00000",
        country: "FR",
      });
    }

    const result = await useCase.execute({
      userId: "user-1",
      label: "Extra",
      street: "St",
      city: "City",
      postalCode: "00000",
      country: "FR",
    });

    expect(result.isFail()).toBe(true);
  });

  it("should reject ProfileNotFound", async () => {
    const result = await useCase.execute({
      userId: "unknown",
      label: "Home",
      street: "123 Main",
      city: "Paris",
      postalCode: "75001",
      country: "FR",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("ProfileNotFound");
  });
});

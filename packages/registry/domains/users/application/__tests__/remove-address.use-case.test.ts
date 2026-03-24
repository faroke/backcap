import { describe, it, expect, beforeEach } from "vitest";
import { RemoveAddress } from "../use-cases/remove-address.use-case.js";
import { AddAddress } from "../use-cases/add-address.use-case.js";
import { InMemoryProfileRepository } from "./mocks/profile-repository.mock.js";
import { createTestProfile } from "./fixtures/profile.fixture.js";

describe("RemoveAddress", () => {
  let repository: InMemoryProfileRepository;
  let removeAddress: RemoveAddress;
  let addAddress: AddAddress;

  beforeEach(() => {
    repository = new InMemoryProfileRepository();
    removeAddress = new RemoveAddress(repository);
    addAddress = new AddAddress(repository);
  });

  it("should remove address by label", async () => {
    const profile = createTestProfile({ userId: "user-1" });
    await repository.save(profile);

    await addAddress.execute({
      userId: "user-1",
      label: "Home",
      street: "123 Main",
      city: "Paris",
      postalCode: "75001",
      country: "FR",
    });

    const result = await removeAddress.execute({
      userId: "user-1",
      label: "Home",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().addresses).toHaveLength(0);
  });

  it("should reject unknown label", async () => {
    const profile = createTestProfile({ userId: "user-1" });
    await repository.save(profile);

    const result = await removeAddress.execute({
      userId: "user-1",
      label: "Office",
    });

    expect(result.isFail()).toBe(true);
  });

  it("should reject ProfileNotFound", async () => {
    const result = await removeAddress.execute({
      userId: "unknown",
      label: "Home",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("ProfileNotFound");
  });
});

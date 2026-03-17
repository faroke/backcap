import { describe, it, expect, beforeEach } from "vitest";
import { CreateFlag } from "../use-cases/create-flag.use-case.js";
import { InMemoryFlagStore } from "./mocks/in-memory-flag-store.mock.js";
import { InvalidFlagKey } from "../../domain/errors/invalid-flag-key.error.js";
import { FlagAlreadyExists } from "../../domain/errors/flag-already-exists.error.js";

describe("CreateFlag use case", () => {
  let flagStore: InMemoryFlagStore;
  let createFlag: CreateFlag;

  beforeEach(() => {
    flagStore = new InMemoryFlagStore();
    createFlag = new CreateFlag(flagStore);
  });

  it("creates a new flag with defaults", async () => {
    const result = await createFlag.execute({ key: "dark-mode" });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.flagId).toBeDefined();
    expect(output.createdAt).toBeInstanceOf(Date);

    const saved = await flagStore.findByKey("dark-mode");
    expect(saved).not.toBeNull();
    expect(saved!.isEnabled).toBe(false);
  });

  it("creates an enabled flag", async () => {
    const result = await createFlag.execute({
      key: "beta-feature",
      isEnabled: true,
    });

    expect(result.isOk()).toBe(true);

    const saved = await flagStore.findByKey("beta-feature");
    expect(saved!.isEnabled).toBe(true);
  });

  it("creates a flag with conditions", async () => {
    const conditions = { percentage: 50, segment: "beta-users" };
    const result = await createFlag.execute({
      key: "rollout-flag",
      conditions,
    });

    expect(result.isOk()).toBe(true);

    const saved = await flagStore.findByKey("rollout-flag");
    expect(saved!.conditions).toEqual(conditions);
  });

  it("fails with invalid flag key", async () => {
    const result = await createFlag.execute({ key: "INVALID KEY!" });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidFlagKey);
  });

  it("fails when flag key already exists", async () => {
    await createFlag.execute({ key: "dark-mode" });
    const result = await createFlag.execute({ key: "dark-mode" });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FlagAlreadyExists);
  });
});

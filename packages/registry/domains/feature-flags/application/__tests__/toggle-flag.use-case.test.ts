import { describe, it, expect, beforeEach } from "vitest";
import { ToggleFlag } from "../use-cases/toggle-flag.use-case.js";
import { InMemoryFlagStore } from "./mocks/in-memory-flag-store.mock.js";
import { createTestFlag, createTestEnabledFlag } from "./fixtures/feature-flag.fixture.js";
import { FlagNotFound } from "../../domain/errors/flag-not-found.error.js";
import { FlagAlreadyInState } from "../../domain/errors/flag-already-in-state.error.js";

describe("ToggleFlag use case", () => {
  let flagStore: InMemoryFlagStore;
  let toggleFlag: ToggleFlag;

  beforeEach(async () => {
    flagStore = new InMemoryFlagStore();
    toggleFlag = new ToggleFlag(flagStore);
  });

  it("enables a disabled flag", async () => {
    const flag = createTestFlag({ key: "my-flag", isEnabled: false });
    await flagStore.save(flag);

    const result = await toggleFlag.execute({ key: "my-flag", enabled: true });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.key).toBe("my-flag");
    expect(output.isEnabled).toBe(true);
    expect(output.updatedAt).toBeInstanceOf(Date);
  });

  it("disables an enabled flag", async () => {
    const flag = createTestEnabledFlag({ key: "my-flag" });
    await flagStore.save(flag);

    const result = await toggleFlag.execute({ key: "my-flag", enabled: false });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.isEnabled).toBe(false);
  });

  it("fails when flag is already in the requested state", async () => {
    const flag = createTestEnabledFlag({ key: "my-flag" });
    await flagStore.save(flag);

    const result = await toggleFlag.execute({ key: "my-flag", enabled: true });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FlagAlreadyInState);
  });

  it("fails when flag is not found", async () => {
    const result = await toggleFlag.execute({ key: "nonexistent", enabled: true });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FlagNotFound);
  });
});

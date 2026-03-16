import { describe, it, expect, beforeEach } from "vitest";
import { EvaluateFlag } from "../use-cases/evaluate-flag.use-case.js";
import { InMemoryFlagStore } from "./mocks/in-memory-flag-store.mock.js";
import { createTestFlag, createTestEnabledFlag } from "./fixtures/feature-flag.fixture.js";
import { FlagNotFound } from "../../domain/errors/flag-not-found.error.js";

describe("EvaluateFlag use case", () => {
  let flagStore: InMemoryFlagStore;
  let evaluateFlag: EvaluateFlag;

  beforeEach(async () => {
    flagStore = new InMemoryFlagStore();
    evaluateFlag = new EvaluateFlag(flagStore);
  });

  it("returns enabled for an enabled flag", async () => {
    const flag = createTestEnabledFlag({ key: "enabled-flag" });
    await flagStore.save(flag);

    const result = await evaluateFlag.execute({ key: "enabled-flag" });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.isEnabled).toBe(true);
    expect(output.key).toBe("enabled-flag");
  });

  it("returns disabled for a disabled flag", async () => {
    const flag = createTestFlag({ key: "disabled-flag", isEnabled: false });
    await flagStore.save(flag);

    const result = await evaluateFlag.execute({ key: "disabled-flag" });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().isEnabled).toBe(false);
  });

  it("fails when flag is not found", async () => {
    const result = await evaluateFlag.execute({ key: "nonexistent" });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FlagNotFound);
  });
});

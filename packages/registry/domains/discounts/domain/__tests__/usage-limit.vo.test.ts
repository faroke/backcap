import { describe, it, expect } from "vitest";
import { UsageLimit } from "../value-objects/usage-limit.vo.js";

describe("UsageLimit VO", () => {
  it("creates with defaults (unlimited)", () => {
    const result = UsageLimit.create({});
    expect(result.isOk()).toBe(true);
    const limit = result.unwrap();
    expect(limit.maxUsesTotal).toBeNull();
    expect(limit.maxUsesPerCustomer).toBeNull();
    expect(limit.currentUses).toBe(0);
  });

  it("creates with limits", () => {
    const result = UsageLimit.create({ maxUsesTotal: 100, maxUsesPerCustomer: 1, currentUses: 5 });
    expect(result.isOk()).toBe(true);
    const limit = result.unwrap();
    expect(limit.maxUsesTotal).toBe(100);
    expect(limit.maxUsesPerCustomer).toBe(1);
    expect(limit.currentUses).toBe(5);
  });

  it("rejects non-positive maxUsesTotal", () => {
    expect(UsageLimit.create({ maxUsesTotal: 0 }).isFail()).toBe(true);
    expect(UsageLimit.create({ maxUsesTotal: -1 }).isFail()).toBe(true);
  });

  it("rejects non-positive maxUsesPerCustomer", () => {
    expect(UsageLimit.create({ maxUsesPerCustomer: 0 }).isFail()).toBe(true);
  });

  it("rejects negative currentUses", () => {
    expect(UsageLimit.create({ currentUses: -1 }).isFail()).toBe(true);
  });

  it("checks exhaustion", () => {
    const limit = UsageLimit.create({ maxUsesTotal: 5, currentUses: 5 }).unwrap();
    expect(limit.isExhausted()).toBe(true);

    const notExhausted = UsageLimit.create({ maxUsesTotal: 5, currentUses: 3 }).unwrap();
    expect(notExhausted.isExhausted()).toBe(false);
  });

  it("unlimited is never exhausted", () => {
    const limit = UsageLimit.create({ currentUses: 9999 }).unwrap();
    expect(limit.isExhausted()).toBe(false);
  });

  it("checks per-customer usage", () => {
    const limit = UsageLimit.create({ maxUsesPerCustomer: 2 }).unwrap();
    expect(limit.canBeUsedByCustomer(0)).toBe(true);
    expect(limit.canBeUsedByCustomer(1)).toBe(true);
    expect(limit.canBeUsedByCustomer(2)).toBe(false);
  });

  it("increments usage", () => {
    const limit = UsageLimit.create({ maxUsesTotal: 5, currentUses: 3 }).unwrap();
    const result = limit.increment();
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().currentUses).toBe(4);
  });

  it("fails to increment when exhausted", () => {
    const limit = UsageLimit.create({ maxUsesTotal: 5, currentUses: 5 }).unwrap();
    const result = limit.increment();
    expect(result.isFail()).toBe(true);
  });
});

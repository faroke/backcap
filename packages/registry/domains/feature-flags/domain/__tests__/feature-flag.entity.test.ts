import { describe, it, expect } from "vitest";
import { FeatureFlag } from "../entities/feature-flag.entity.js";
import { InvalidFlagKey } from "../errors/invalid-flag-key.error.js";
import { FlagToggled } from "../events/flag-toggled.event.js";

describe("FeatureFlag entity", () => {
  const validParams = {
    id: "flag-1",
    key: "my-feature",
  };

  it("creates a valid feature flag", () => {
    const result = FeatureFlag.create(validParams);
    expect(result.isOk()).toBe(true);
    const flag = result.unwrap();
    expect(flag.id).toBe("flag-1");
    expect(flag.key.value).toBe("my-feature");
    expect(flag.isEnabled).toBe(false);
    expect(flag.conditions).toBeUndefined();
    expect(flag.createdAt).toBeInstanceOf(Date);
  });

  it("creates a flag with isEnabled true", () => {
    const result = FeatureFlag.create({ ...validParams, isEnabled: true });
    expect(result.unwrap().isEnabled).toBe(true);
  });

  it("creates a flag with conditions", () => {
    const conditions = { region: "us-east", percentage: 50 };
    const result = FeatureFlag.create({ ...validParams, conditions });
    expect(result.unwrap().conditions).toEqual(conditions);
  });

  it("fails with invalid key", () => {
    const result = FeatureFlag.create({ ...validParams, key: "INVALID" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidFlagKey);
  });

  it("enable returns new flag with isEnabled true and FlagToggled event", () => {
    const flag = FeatureFlag.create(validParams).unwrap();
    const { flag: enabled, event } = flag.enable();

    expect(enabled.isEnabled).toBe(true);
    expect(enabled.id).toBe(flag.id);
    expect(enabled.key.value).toBe(flag.key.value);
    // Original unchanged
    expect(flag.isEnabled).toBe(false);
    // Event
    expect(event).toBeInstanceOf(FlagToggled);
    expect(event.flagId).toBe("flag-1");
    expect(event.key).toBe("my-feature");
    expect(event.isEnabled).toBe(true);
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("disable returns new flag with isEnabled false and FlagToggled event", () => {
    const flag = FeatureFlag.create({ ...validParams, isEnabled: true }).unwrap();
    const { flag: disabled, event } = flag.disable();

    expect(disabled.isEnabled).toBe(false);
    // Original unchanged
    expect(flag.isEnabled).toBe(true);
    // Event
    expect(event).toBeInstanceOf(FlagToggled);
    expect(event.isEnabled).toBe(false);
  });
});

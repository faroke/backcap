import { describe, it, expect } from "vitest";
import { DisplayName } from "../value-objects/display-name.vo.js";

describe("DisplayName", () => {
  it("should create a valid display name", () => {
    const result = DisplayName.create("Jane Doe");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("Jane Doe");
  });

  it("should trim whitespace", () => {
    const result = DisplayName.create("  Jane Doe  ");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("Jane Doe");
  });

  it("should reject empty string", () => {
    const result = DisplayName.create("");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidDisplayName");
  });

  it("should reject whitespace-only string", () => {
    const result = DisplayName.create("   ");
    expect(result.isFail()).toBe(true);
  });

  it("should reject name over 100 characters", () => {
    const result = DisplayName.create("a".repeat(101));
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidDisplayName");
  });

  it("should accept name of exactly 100 characters", () => {
    const result = DisplayName.create("a".repeat(100));
    expect(result.isOk()).toBe(true);
  });

  it("should have immutable value", () => {
    const dn = DisplayName.create("Jane").unwrap();
    expect(dn.value).toBe("Jane");
  });
});

import { describe, it, expect } from "vitest";
import { TrackingNumber } from "../value-objects/tracking-number.vo.js";

describe("TrackingNumber", () => {
  it("creates a valid tracking number", () => {
    const result = TrackingNumber.create("ABC-12345");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("ABC-12345");
  });

  it("uppercases the value", () => {
    const result = TrackingNumber.create("abc-12345");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("ABC-12345");
  });

  it("rejects empty value", () => {
    const result = TrackingNumber.create("   ");
    expect(result.isFail()).toBe(true);
  });

  it("rejects too short value (< 6 chars)", () => {
    const result = TrackingNumber.create("AB123");
    expect(result.isFail()).toBe(true);
  });

  it("rejects too long value (> 40 chars)", () => {
    const result = TrackingNumber.create("A".repeat(41));
    expect(result.isFail()).toBe(true);
  });

  it("rejects special characters", () => {
    const result = TrackingNumber.create("TR@CK!NG");
    expect(result.isFail()).toBe(true);
  });

  it("equals() works correctly", () => {
    const a = TrackingNumber.create("ABC-12345").unwrap();
    const b = TrackingNumber.create("abc-12345").unwrap();
    const c = TrackingNumber.create("XYZ-99999").unwrap();
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});

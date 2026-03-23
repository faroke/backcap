import { describe, it, expect } from "vitest";
import { TrackingId } from "../value-objects/tracking-id.vo.js";
import { InvalidTrackingId } from "../errors/invalid-tracking-id.error.js";

describe("TrackingId VO", () => {
  it("creates a valid tracking ID", () => {
    const result = TrackingId.create("abc12345");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("abc12345");
  });

  it("accepts a UUID-like string", () => {
    const result = TrackingId.create("550e8400-e29b-41d4-a716-446655440000");
    expect(result.isOk()).toBe(true);
  });

  it("accepts a 64-character string", () => {
    const result = TrackingId.create("a".repeat(64));
    expect(result.isOk()).toBe(true);
  });

  it("rejects a string shorter than 8 characters", () => {
    const result = TrackingId.create("abc1234");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidTrackingId);
  });

  it("rejects a string longer than 64 characters", () => {
    const result = TrackingId.create("a".repeat(65));
    expect(result.isFail()).toBe(true);
  });

  it("rejects an empty string", () => {
    const result = TrackingId.create("");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidTrackingId);
  });

  it("rejects strings with special characters", () => {
    const result = TrackingId.create("abc@1234!");
    expect(result.isFail()).toBe(true);
  });

  it("is immutable (readonly value)", () => {
    const trackingId = TrackingId.create("abcd1234").unwrap();
    expect(trackingId.value).toBe("abcd1234");
  });
});

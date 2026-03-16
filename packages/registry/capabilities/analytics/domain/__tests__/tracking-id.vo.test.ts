import { describe, it, expect } from "vitest";
import { TrackingId } from "../value-objects/tracking-id.vo.js";
import { InvalidTrackingId } from "../errors/invalid-tracking-id.error.js";

describe("TrackingId VO", () => {
  it("creates a valid tracking ID (8 chars)", () => {
    const result = TrackingId.create("abcd1234");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("abcd1234");
  });

  it("creates a valid tracking ID (64 chars)", () => {
    const id = "a".repeat(64);
    const result = TrackingId.create(id);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe(id);
  });

  it("accepts uppercase alphanumeric", () => {
    const result = TrackingId.create("ABCDEFGH");
    expect(result.isOk()).toBe(true);
  });

  it("rejects too short (7 chars)", () => {
    const result = TrackingId.create("abcd123");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidTrackingId);
  });

  it("rejects too long (65 chars)", () => {
    const result = TrackingId.create("a".repeat(65));
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidTrackingId);
  });

  it("rejects non-alphanumeric characters", () => {
    const result = TrackingId.create("abcd-1234");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidTrackingId);
  });

  it("rejects empty string", () => {
    const result = TrackingId.create("");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidTrackingId);
  });
});

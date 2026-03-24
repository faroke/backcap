import { describe, it, expect } from "vitest";
import { Timezone } from "../value-objects/timezone.vo.js";

describe("Timezone", () => {
  it("should accept valid IANA timezone", () => {
    const result = Timezone.create("America/New_York");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("America/New_York");
  });

  it("should accept UTC", () => {
    const result = Timezone.create("UTC");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("UTC");
  });

  it("should accept multi-segment timezone", () => {
    const result = Timezone.create("America/Indiana/Knox");
    expect(result.isOk()).toBe(true);
  });

  it("should accept timezone with hyphens", () => {
    const result = Timezone.create("America/Port-au-Prince");
    expect(result.isOk()).toBe(true);
  });

  it("should accept Asia/Tokyo timezone", () => {
    const result = Timezone.create("Asia/Tokyo");
    expect(result.isOk()).toBe(true);
  });

  it("should reject empty string", () => {
    const result = Timezone.create("");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidTimezone");
  });

  it("should reject invalid timezone", () => {
    const result = Timezone.create("Not/A_Real_Zone");
    expect(result.isFail()).toBe(true);
  });

  it("should have immutable value", () => {
    const tz = Timezone.create("Europe/Paris").unwrap();
    expect(tz.value).toBe("Europe/Paris");
  });
});

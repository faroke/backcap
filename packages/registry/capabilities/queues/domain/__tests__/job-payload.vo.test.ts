import { describe, it, expect } from "vitest";
import { JobPayload } from "../value-objects/job-payload.vo.js";
import { InvalidJobPayload } from "../errors/invalid-job-payload.error.js";

describe("JobPayload value object", () => {
  it("creates from a valid plain object", () => {
    const result = JobPayload.create({ task: "send-email" });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toEqual({ task: "send-email" });
  });

  it("creates from an empty object", () => {
    const result = JobPayload.create({});

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toEqual({});
  });

  it("rejects null", () => {
    const result = JobPayload.create(null);

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidJobPayload);
  });

  it("rejects undefined", () => {
    const result = JobPayload.create(undefined);

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidJobPayload);
  });

  it("rejects an array", () => {
    const result = JobPayload.create([1, 2, 3]);

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidJobPayload);
  });

  it("rejects a primitive string", () => {
    const result = JobPayload.create("not-an-object");

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidJobPayload);
  });

  it("rejects a number", () => {
    const result = JobPayload.create(42);

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidJobPayload);
  });
});

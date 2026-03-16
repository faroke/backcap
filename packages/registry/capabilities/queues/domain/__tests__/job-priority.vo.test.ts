import { describe, it, expect } from "vitest";
import { JobPriority } from "../value-objects/job-priority.vo.js";
import { InvalidPriority } from "../errors/invalid-priority.error.js";

describe("JobPriority VO", () => {
  it.each(["low", "normal", "high", "critical"])(
    'accepts valid priority "%s"',
    (priority) => {
      const result = JobPriority.create(priority);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().value).toBe(priority);
    },
  );

  it("rejects an unknown priority level", () => {
    const result = JobPriority.create("urgent");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidPriority);
  });

  it("rejects empty string", () => {
    const result = JobPriority.create("");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidPriority);
  });

  it("is immutable (readonly value)", () => {
    const priority = JobPriority.create("high").unwrap();
    expect(priority.value).toBe("high");
  });
});

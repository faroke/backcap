import { describe, it, expect } from "vitest";
import { SubscriptionStatus } from "../value-objects/subscription-status.vo.js";

describe("SubscriptionStatus VO", () => {
  it("creates valid statuses", () => {
    for (const status of ["active", "canceled", "past_due", "trialing", "paused", "incomplete"]) {
      const result = SubscriptionStatus.create(status);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().value).toBe(status);
    }
  });

  it("rejects invalid status", () => {
    const result = SubscriptionStatus.create("invalid");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("invalid");
  });

  it("isActive returns true for active and trialing", () => {
    expect(SubscriptionStatus.create("active").unwrap().isActive()).toBe(true);
    expect(SubscriptionStatus.create("trialing").unwrap().isActive()).toBe(true);
    expect(SubscriptionStatus.create("canceled").unwrap().isActive()).toBe(false);
    expect(SubscriptionStatus.create("past_due").unwrap().isActive()).toBe(false);
  });

  it("isCanceled returns true only for canceled", () => {
    expect(SubscriptionStatus.create("canceled").unwrap().isCanceled()).toBe(true);
    expect(SubscriptionStatus.create("active").unwrap().isCanceled()).toBe(false);
  });
});

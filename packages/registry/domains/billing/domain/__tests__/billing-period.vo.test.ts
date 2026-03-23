import { describe, it, expect } from "vitest";
import { BillingPeriod } from "../value-objects/billing-period.vo.js";

describe("BillingPeriod VO", () => {
  it("creates a valid monthly period", () => {
    const start = new Date("2026-01-01");
    const end = new Date("2026-02-01");
    const result = BillingPeriod.create("monthly", start, end);
    expect(result.isOk()).toBe(true);
    const period = result.unwrap();
    expect(period.interval).toBe("monthly");
    expect(period.startDate).toEqual(start);
    expect(period.endDate).toEqual(end);
  });

  it("creates a valid yearly period", () => {
    const start = new Date("2026-01-01");
    const end = new Date("2027-01-01");
    const result = BillingPeriod.create("yearly", start, end);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().interval).toBe("yearly");
  });

  it("rejects end date before start date", () => {
    const start = new Date("2026-02-01");
    const end = new Date("2026-01-01");
    const result = BillingPeriod.create("monthly", start, end);
    expect(result.isFail()).toBe(true);
  });

  it("rejects same start and end date", () => {
    const date = new Date("2026-01-01");
    const result = BillingPeriod.create("monthly", date, date);
    expect(result.isFail()).toBe(true);
  });

  it("checks if period is active", () => {
    const start = new Date("2026-01-01");
    const end = new Date("2026-02-01");
    const period = BillingPeriod.create("monthly", start, end).unwrap();
    expect(period.isActive(new Date("2026-01-15"))).toBe(true);
    expect(period.isActive(new Date("2026-03-01"))).toBe(false);
    expect(period.isActive(new Date("2025-12-01"))).toBe(false);
  });
});

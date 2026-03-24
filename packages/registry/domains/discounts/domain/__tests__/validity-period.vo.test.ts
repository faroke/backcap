import { describe, it, expect } from "vitest";
import { ValidityPeriod } from "../value-objects/validity-period.vo.js";

describe("ValidityPeriod VO", () => {
  it("creates a valid period", () => {
    const start = new Date("2026-01-01");
    const end = new Date("2026-02-01");
    const result = ValidityPeriod.create(start, end);
    expect(result.isOk()).toBe(true);
    const period = result.unwrap();
    expect(period.startDate).toEqual(start);
    expect(period.endDate).toEqual(end);
  });

  it("rejects end date before start date", () => {
    const result = ValidityPeriod.create(new Date("2026-02-01"), new Date("2026-01-01"));
    expect(result.isFail()).toBe(true);
  });

  it("rejects same start and end date", () => {
    const date = new Date("2026-01-01");
    const result = ValidityPeriod.create(date, date);
    expect(result.isFail()).toBe(true);
  });

  it("checks if period is active", () => {
    const period = ValidityPeriod.create(new Date("2026-01-01"), new Date("2026-02-01")).unwrap();
    expect(period.isActive(new Date("2026-01-15"))).toBe(true);
    expect(period.isActive(new Date("2026-03-01"))).toBe(false);
    expect(period.isActive(new Date("2025-12-01"))).toBe(false);
  });

  it("checks if period has expired", () => {
    const period = ValidityPeriod.create(new Date("2026-01-01"), new Date("2026-02-01")).unwrap();
    expect(period.hasExpired(new Date("2026-03-01"))).toBe(true);
    expect(period.hasExpired(new Date("2026-01-15"))).toBe(false);
  });
});

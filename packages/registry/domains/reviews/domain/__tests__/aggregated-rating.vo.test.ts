import { describe, it, expect } from "vitest";
import { AggregatedRating } from "../value-objects/aggregated-rating.vo.js";

describe("AggregatedRating", () => {
  it("computes correct average from distribution", () => {
    const result = AggregatedRating.compute({ 1: 0, 2: 0, 3: 1, 4: 2, 5: 2 });
    expect(result.average).toBe(4.2);
    expect(result.count).toBe(5);
  });

  it("returns average 0 and count 0 for empty distribution", () => {
    const result = AggregatedRating.compute({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    expect(result.average).toBe(0);
    expect(result.count).toBe(0);
  });

  it("rounds average to 2 decimal places", () => {
    // 1*1 + 2*1 + 3*1 = 6 / 3 = 2.0
    // 3*1 + 4*1 + 5*1 = 12 / 3 = 4.0
    // Let's use a distribution that produces a repeating decimal
    // 1*1 + 5*2 = 11 / 3 = 3.666... => 3.67
    const result = AggregatedRating.compute({ 1: 1, 2: 0, 3: 0, 4: 0, 5: 2 });
    expect(result.average).toBe(3.67);
  });

  it("preserves distribution in output", () => {
    const dist = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 } as Record<1 | 2 | 3 | 4 | 5, number>;
    const result = AggregatedRating.compute(dist);
    expect(result.distribution).toEqual({ 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 });
  });
});

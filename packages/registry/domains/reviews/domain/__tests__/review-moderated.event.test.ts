import { describe, it, expect } from "vitest";
import { ReviewModerated } from "../events/review-moderated.event.js";

describe("ReviewModerated", () => {
  it("creates event with default occurredAt", () => {
    const before = new Date();
    const event = new ReviewModerated("r-1", "mod-1", "approved");
    const after = new Date();
    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("accepts explicit occurredAt", () => {
    const date = new Date("2025-01-01");
    const event = new ReviewModerated("r-1", "mod-1", "approved", date);
    expect(event.occurredAt).toBe(date);
  });

  it("stores all fields", () => {
    const event = new ReviewModerated("r-1", "mod-1", "rejected");
    expect(event.reviewId).toBe("r-1");
    expect(event.moderatorId).toBe("mod-1");
    expect(event.newStatus).toBe("rejected");
  });
});

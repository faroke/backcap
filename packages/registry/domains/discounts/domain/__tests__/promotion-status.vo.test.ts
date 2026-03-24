import { describe, it, expect } from "vitest";
import { PromotionStatus } from "../value-objects/promotion-status.vo.js";

describe("PromotionStatus VO", () => {
  it("creates from valid value", () => {
    const result = PromotionStatus.from("draft");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("draft");
  });

  it("rejects invalid status", () => {
    const result = PromotionStatus.from("bogus");
    expect(result.isFail()).toBe(true);
  });

  it("creates draft via static method", () => {
    const status = PromotionStatus.draft();
    expect(status.isDraft()).toBe(true);
  });

  it("creates active via static method", () => {
    const status = PromotionStatus.active();
    expect(status.isActive()).toBe(true);
  });

  it("checks status predicates", () => {
    expect(PromotionStatus.from("inactive").unwrap().isInactive()).toBe(true);
    expect(PromotionStatus.from("expired").unwrap().isExpired()).toBe(true);
  });

  it("checks canActivate", () => {
    expect(PromotionStatus.draft().canActivate()).toBe(true);
    expect(PromotionStatus.from("inactive").unwrap().canActivate()).toBe(true);
    expect(PromotionStatus.active().canActivate()).toBe(false);
    expect(PromotionStatus.from("expired").unwrap().canActivate()).toBe(false);
  });

  it("checks canDeactivate", () => {
    expect(PromotionStatus.active().canDeactivate()).toBe(true);
    expect(PromotionStatus.draft().canDeactivate()).toBe(false);
  });
});

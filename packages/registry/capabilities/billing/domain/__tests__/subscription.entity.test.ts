import { describe, it, expect } from "vitest";
import { Subscription } from "../entities/subscription.entity.js";
import { Money } from "../value-objects/money.vo.js";

const validParams = {
  id: "sub-1",
  customerId: "cust-1",
  planId: "plan-pro",
  status: "active",
  priceAmount: 2999,
  priceCurrency: "USD",
  billingInterval: "monthly" as const,
  billingStartDate: new Date("2026-01-01"),
  billingEndDate: new Date("2026-02-01"),
};

describe("Subscription entity", () => {
  it("creates a valid subscription", () => {
    const result = Subscription.create(validParams);
    expect(result.isOk()).toBe(true);
    const sub = result.unwrap();
    expect(sub.id).toBe("sub-1");
    expect(sub.customerId).toBe("cust-1");
    expect(sub.planId).toBe("plan-pro");
    expect(sub.status.value).toBe("active");
    expect(sub.price.amount).toBe(2999);
    expect(sub.price.currency).toBe("USD");
    expect(sub.billingPeriod.interval).toBe("monthly");
  });

  it("rejects invalid status", () => {
    const result = Subscription.create({ ...validParams, status: "bad" });
    expect(result.isFail()).toBe(true);
  });

  it("rejects invalid price", () => {
    const result = Subscription.create({ ...validParams, priceAmount: 10.5 });
    expect(result.isFail()).toBe(true);
  });

  it("rejects invalid billing period", () => {
    const result = Subscription.create({
      ...validParams,
      billingStartDate: new Date("2026-02-01"),
      billingEndDate: new Date("2026-01-01"),
    });
    expect(result.isFail()).toBe(true);
  });

  it("cancels an active subscription", () => {
    const sub = Subscription.create(validParams).unwrap();
    const cancelResult = sub.cancel();
    expect(cancelResult.isOk()).toBe(true);
    const canceled = cancelResult.unwrap();
    expect(canceled.status.isCanceled()).toBe(true);
    expect(canceled.canceledAt).toBeInstanceOf(Date);
  });

  it("fails to cancel already canceled subscription", () => {
    const sub = Subscription.create({ ...validParams, status: "canceled" }).unwrap();
    const result = sub.cancel();
    expect(result.isFail()).toBe(true);
  });

  it("changes plan on active subscription", () => {
    const sub = Subscription.create(validParams).unwrap();
    const newPrice = Money.create(4999, "USD").unwrap();
    const result = sub.changePlan("plan-enterprise", newPrice);
    expect(result.isOk()).toBe(true);
    const updated = result.unwrap();
    expect(updated.planId).toBe("plan-enterprise");
    expect(updated.price.amount).toBe(4999);
  });

  it("fails to change plan on canceled subscription", () => {
    const sub = Subscription.create({ ...validParams, status: "canceled" }).unwrap();
    const newPrice = Money.create(4999, "USD").unwrap();
    const result = sub.changePlan("plan-enterprise", newPrice);
    expect(result.isFail()).toBe(true);
  });

  it("fails to change plan with currency mismatch", () => {
    const sub = Subscription.create(validParams).unwrap();
    const newPrice = Money.create(4999, "EUR").unwrap();
    const result = sub.changePlan("plan-enterprise", newPrice);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("Currency mismatch");
  });
});

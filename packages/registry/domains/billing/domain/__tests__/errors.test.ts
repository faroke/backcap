import { describe, it, expect } from "vitest";
import { PaymentDeclined } from "../errors/payment-declined.error.js";
import { SubscriptionNotFound } from "../errors/subscription-not-found.error.js";
import { InvalidPlan } from "../errors/invalid-plan.error.js";
import { CustomerNotFound } from "../errors/customer-not-found.error.js";

describe("Billing domain errors", () => {
  it("creates PaymentDeclined error", () => {
    const error = PaymentDeclined.create("insufficient funds");
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("PaymentDeclined");
    expect(error.message).toContain("insufficient funds");
  });

  it("creates PaymentDeclined without reason", () => {
    const error = PaymentDeclined.create();
    expect(error.message).toBe("Payment declined");
  });

  it("creates SubscriptionNotFound error", () => {
    const error = SubscriptionNotFound.create("sub-123");
    expect(error.name).toBe("SubscriptionNotFound");
    expect(error.message).toContain("sub-123");
  });

  it("creates InvalidPlan error", () => {
    const error = InvalidPlan.create("plan-xyz");
    expect(error.name).toBe("InvalidPlan");
    expect(error.message).toContain("plan-xyz");
  });

  it("creates CustomerNotFound error", () => {
    const error = CustomerNotFound.create("cust-456");
    expect(error.name).toBe("CustomerNotFound");
    expect(error.message).toContain("cust-456");
  });
});

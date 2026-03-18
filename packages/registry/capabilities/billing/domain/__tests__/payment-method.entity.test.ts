import { describe, it, expect } from "vitest";
import { PaymentMethod } from "../entities/payment-method.entity.js";

describe("PaymentMethod entity", () => {
  const validParams = {
    id: "pm-1",
    customerId: "cust-1",
    type: "card" as const,
    last4: "4242",
    expiryMonth: 12,
    expiryYear: 2027,
  };

  it("creates a valid payment method", () => {
    const result = PaymentMethod.create(validParams);
    expect(result.isOk()).toBe(true);
    const pm = result.unwrap();
    expect(pm.id).toBe("pm-1");
    expect(pm.last4).toBe("4242");
    expect(pm.type).toBe("card");
    expect(pm.isDefault).toBe(false);
  });

  it("rejects invalid last4", () => {
    expect(PaymentMethod.create({ ...validParams, last4: "123" }).isFail()).toBe(true);
    expect(PaymentMethod.create({ ...validParams, last4: "abcd" }).isFail()).toBe(true);
    expect(PaymentMethod.create({ ...validParams, last4: "12345" }).isFail()).toBe(true);
  });

  it("rejects invalid expiry month", () => {
    expect(PaymentMethod.create({ ...validParams, expiryMonth: 0 }).isFail()).toBe(true);
    expect(PaymentMethod.create({ ...validParams, expiryMonth: 13 }).isFail()).toBe(true);
  });

  it("rejects invalid expiry year", () => {
    expect(PaymentMethod.create({ ...validParams, expiryYear: -1 }).isFail()).toBe(true);
    expect(PaymentMethod.create({ ...validParams, expiryYear: 1999 }).isFail()).toBe(true);
    expect(PaymentMethod.create({ ...validParams, expiryYear: 2101 }).isFail()).toBe(true);
  });

  it("sets as default", () => {
    const pm = PaymentMethod.create(validParams).unwrap();
    const defaultPm = pm.setAsDefault();
    expect(defaultPm.isDefault).toBe(true);
    expect(pm.isDefault).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import { Invoice } from "../entities/invoice.entity.js";

describe("Invoice entity", () => {
  const validParams = {
    id: "inv-1",
    customerId: "cust-1",
    subscriptionId: "sub-1",
    amountValue: 2999,
    amountCurrency: "USD",
    status: "open" as const,
    dueDate: new Date("2026-02-01"),
  };

  it("creates a valid invoice", () => {
    const result = Invoice.create(validParams);
    expect(result.isOk()).toBe(true);
    const invoice = result.unwrap();
    expect(invoice.id).toBe("inv-1");
    expect(invoice.amount.amount).toBe(2999);
    expect(invoice.status).toBe("open");
  });

  it("rejects invalid amount", () => {
    const result = Invoice.create({ ...validParams, amountValue: 10.5 });
    expect(result.isFail()).toBe(true);
  });

  it("marks invoice as paid", () => {
    const invoice = Invoice.create(validParams).unwrap();
    const result = invoice.markPaid();
    expect(result.isOk()).toBe(true);
    const paid = result.unwrap();
    expect(paid.status).toBe("paid");
    expect(paid.paidAt).toBeInstanceOf(Date);
  });

  it("fails to pay already paid invoice", () => {
    const invoice = Invoice.create({ ...validParams, status: "paid" }).unwrap();
    expect(invoice.markPaid().isFail()).toBe(true);
  });

  it("fails to pay voided invoice", () => {
    const invoice = Invoice.create({ ...validParams, status: "void" }).unwrap();
    expect(invoice.markPaid().isFail()).toBe(true);
  });

  it("fails to pay uncollectible invoice", () => {
    const invoice = Invoice.create({ ...validParams, status: "uncollectible" }).unwrap();
    expect(invoice.markPaid().isFail()).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = Invoice.create({ ...validParams, status: "bogus" as any });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("Invalid invoice status");
  });
});

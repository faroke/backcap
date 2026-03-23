import { describe, it, expect } from "vitest";
import { Customer } from "../entities/customer.entity.js";

describe("Customer entity", () => {
  it("creates a valid customer", () => {
    const result = Customer.create({
      id: "cust-1",
      email: "user@example.com",
      name: "John Doe",
    });
    expect(result.isOk()).toBe(true);
    const customer = result.unwrap();
    expect(customer.id).toBe("cust-1");
    expect(customer.email).toBe("user@example.com");
    expect(customer.name).toBe("John Doe");
    expect(customer.externalId).toBeUndefined();
    expect(customer.createdAt).toBeInstanceOf(Date);
  });

  it("rejects invalid email", () => {
    const result = Customer.create({ id: "cust-1", email: "invalid", name: "John" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("email");
  });

  it("rejects empty name", () => {
    const result = Customer.create({ id: "cust-1", email: "a@b.com", name: "" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("name");
  });

  it("trims name", () => {
    const customer = Customer.create({ id: "cust-1", email: "a@b.com", name: "  John  " }).unwrap();
    expect(customer.name).toBe("John");
  });

  it("sets externalId via withExternalId", () => {
    const customer = Customer.create({ id: "cust-1", email: "a@b.com", name: "John" }).unwrap();
    const updated = customer.withExternalId("ext-123");
    expect(updated.externalId).toBe("ext-123");
    expect(updated.id).toBe("cust-1");
    expect(customer.externalId).toBeUndefined();
  });
});

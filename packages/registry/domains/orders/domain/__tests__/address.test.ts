import { describe, it, expect } from "vitest";
import { Address } from "../value-objects/address.vo.js";

describe("Address value object", () => {
  const validParams = {
    street: "123 Main St",
    city: "Paris",
    country: "France",
    postalCode: "75001",
  };

  it("creates a valid address", () => {
    const result = Address.create(validParams);
    expect(result.isOk()).toBe(true);
    const addr = result.unwrap();
    expect(addr.street).toBe("123 Main St");
    expect(addr.city).toBe("Paris");
    expect(addr.country).toBe("France");
    expect(addr.postalCode).toBe("75001");
  });

  it("trims whitespace", () => {
    const result = Address.create({ ...validParams, street: "  123 Main St  " });
    expect(result.unwrap().street).toBe("123 Main St");
  });

  it("rejects empty street", () => {
    expect(Address.create({ ...validParams, street: "" }).isFail()).toBe(true);
  });

  it("rejects empty city", () => {
    expect(Address.create({ ...validParams, city: "  " }).isFail()).toBe(true);
  });

  it("rejects empty country", () => {
    expect(Address.create({ ...validParams, country: "" }).isFail()).toBe(true);
  });

  it("rejects empty postal code", () => {
    expect(Address.create({ ...validParams, postalCode: "" }).isFail()).toBe(true);
  });

  describe("equals", () => {
    it("equal addresses", () => {
      const a = Address.create(validParams).unwrap();
      const b = Address.create(validParams).unwrap();
      expect(a.equals(b)).toBe(true);
    });

    it("different addresses", () => {
      const a = Address.create(validParams).unwrap();
      const b = Address.create({ ...validParams, city: "Lyon" }).unwrap();
      expect(a.equals(b)).toBe(false);
    });
  });
});

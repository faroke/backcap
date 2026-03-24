import { describe, it, expect } from "vitest";
import { Address } from "../value-objects/address.vo.js";

describe("Address", () => {
  const validParams = {
    label: "Home",
    street: "123 Main St",
    city: "Paris",
    postalCode: "75001",
    country: "FR",
  };

  it("should create valid address with all fields", () => {
    const result = Address.create({ ...validParams, state: "IDF" });
    expect(result.isOk()).toBe(true);
    const addr = result.unwrap();
    expect(addr.label).toBe("Home");
    expect(addr.street).toBe("123 Main St");
    expect(addr.city).toBe("Paris");
    expect(addr.postalCode).toBe("75001");
    expect(addr.country).toBe("FR");
    expect(addr.state).toBe("IDF");
  });

  it("should create valid address without state", () => {
    const result = Address.create(validParams);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().state).toBeUndefined();
  });

  it("should reject empty label", () => {
    const result = Address.create({ ...validParams, label: "" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidAddress");
  });

  it("should reject empty street", () => {
    const result = Address.create({ ...validParams, street: "" });
    expect(result.isFail()).toBe(true);
  });

  it("should reject empty city", () => {
    const result = Address.create({ ...validParams, city: "" });
    expect(result.isFail()).toBe(true);
  });

  it("should reject empty postalCode", () => {
    const result = Address.create({ ...validParams, postalCode: "" });
    expect(result.isFail()).toBe(true);
  });

  it("should reject empty country", () => {
    const result = Address.create({ ...validParams, country: "" });
    expect(result.isFail()).toBe(true);
  });

  it("equals should return true for same fields", () => {
    const a = Address.create(validParams).unwrap();
    const b = Address.create(validParams).unwrap();
    expect(a.equals(b)).toBe(true);
  });

  it("equals should return false for different fields", () => {
    const a = Address.create(validParams).unwrap();
    const b = Address.create({ ...validParams, city: "Lyon" }).unwrap();
    expect(a.equals(b)).toBe(false);
  });
});

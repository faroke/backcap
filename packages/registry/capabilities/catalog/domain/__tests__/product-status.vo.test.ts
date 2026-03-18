import { describe, it, expect } from "vitest";
import { ProductStatus } from "../value-objects/product-status.vo.js";

describe("ProductStatus VO", () => {
  it("creates draft status", () => {
    const status = ProductStatus.draft();
    expect(status.value).toBe("draft");
    expect(status.isDraft()).toBe(true);
    expect(status.isActive()).toBe(false);
    expect(status.isArchived()).toBe(false);
  });

  it("creates active status", () => {
    const status = ProductStatus.active();
    expect(status.value).toBe("active");
    expect(status.isActive()).toBe(true);
  });

  it("creates archived status", () => {
    const status = ProductStatus.archived();
    expect(status.value).toBe("archived");
    expect(status.isArchived()).toBe(true);
  });

  it("restores from string", () => {
    const result = ProductStatus.from("active");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().isActive()).toBe(true);
  });

  it("fails for invalid status string", () => {
    const result = ProductStatus.from("invalid");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("Invalid product status");
  });

  describe("equals", () => {
    it("returns true for same status", () => {
      expect(ProductStatus.draft().equals(ProductStatus.draft())).toBe(true);
    });

    it("returns false for different status", () => {
      expect(ProductStatus.draft().equals(ProductStatus.active())).toBe(false);
    });
  });
});

import { describe, it, expect } from "vitest";
import { WarehouseId } from "../value-objects/warehouse-id.vo.js";

describe("WarehouseId VO", () => {
  it("creates valid warehouse ID", () => {
    const result = WarehouseId.create("warehouse-main");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("warehouse-main");
  });

  it("rejects empty string", () => {
    const result = WarehouseId.create("");
    expect(result.isFail()).toBe(true);
  });

  it("trims whitespace", () => {
    const result = WarehouseId.create("  wh-1  ");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("wh-1");
  });

  it("rejects string exceeding 100 chars", () => {
    const result = WarehouseId.create("a".repeat(101));
    expect(result.isFail()).toBe(true);
  });

  it("accepts string of exactly 100 chars", () => {
    const result = WarehouseId.create("a".repeat(100));
    expect(result.isOk()).toBe(true);
  });

  it("equals() comparison", () => {
    const a = WarehouseId.create("wh-1").unwrap();
    const b = WarehouseId.create("wh-1").unwrap();
    const c = WarehouseId.create("wh-2").unwrap();
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});

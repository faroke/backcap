import { describe, it, expect } from "vitest";
import { StockLevel } from "../entities/stock-level.entity.js";

describe("StockLevel Entity", () => {
  const validParams = {
    id: "stock-1",
    sku: "SKU-001",
    warehouseId: "warehouse-main",
    totalQuantity: 100,
  };

  describe("create", () => {
    it("creates with valid params and defaults", () => {
      const result = StockLevel.create(validParams);
      expect(result.isOk()).toBe(true);
      const stock = result.unwrap();
      expect(stock.id).toBe("stock-1");
      expect(stock.sku).toBe("SKU-001");
      expect(stock.warehouseId.value).toBe("warehouse-main");
      expect(stock.total.value).toBe(100);
      expect(stock.reserved.value).toBe(0);
      expect(stock.available.value).toBe(100);
      expect(stock.lowStockThreshold).toBe(0);
      expect(stock.createdAt).toBeInstanceOf(Date);
      expect(stock.updatedAt).toBeInstanceOf(Date);
    });

    it("creates with explicit reserved and threshold", () => {
      const result = StockLevel.create({
        ...validParams,
        reservedQuantity: 20,
        lowStockThreshold: 10,
      });
      expect(result.isOk()).toBe(true);
      const stock = result.unwrap();
      expect(stock.reserved.value).toBe(20);
      expect(stock.available.value).toBe(80);
      expect(stock.lowStockThreshold).toBe(10);
    });

    it("rejects empty SKU", () => {
      const result = StockLevel.create({ ...validParams, sku: "" });
      expect(result.isFail()).toBe(true);
    });

    it("rejects invalid warehouse ID", () => {
      const result = StockLevel.create({ ...validParams, warehouseId: "" });
      expect(result.isFail()).toBe(true);
    });

    it("rejects negative total", () => {
      const result = StockLevel.create({ ...validParams, totalQuantity: -1 });
      expect(result.isFail()).toBe(true);
    });

    it("rejects reserved > total", () => {
      const result = StockLevel.create({ ...validParams, totalQuantity: 10, reservedQuantity: 20 });
      expect(result.isFail()).toBe(true);
    });

    it("accepts reserved = total", () => {
      const result = StockLevel.create({ ...validParams, totalQuantity: 10, reservedQuantity: 10 });
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().available.value).toBe(0);
    });
  });

  describe("available field", () => {
    it("equals total - reserved after creation", () => {
      const stock = StockLevel.create({ ...validParams, totalQuantity: 50, reservedQuantity: 15 }).unwrap();
      expect(stock.available.value).toBe(35);
    });
  });

  describe("isLowStock", () => {
    it("returns true when available <= threshold", () => {
      const stock = StockLevel.create({ ...validParams, totalQuantity: 10, lowStockThreshold: 10 }).unwrap();
      expect(stock.isLowStock).toBe(true);
    });

    it("returns false when available > threshold", () => {
      const stock = StockLevel.create({ ...validParams, totalQuantity: 100, lowStockThreshold: 10 }).unwrap();
      expect(stock.isLowStock).toBe(false);
    });
  });

  describe("adjustTotal", () => {
    it("increases total", () => {
      const stock = StockLevel.create(validParams).unwrap();
      const result = stock.adjustTotal(200, "recount");
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().total.value).toBe(200);
      expect(result.unwrap().available.value).toBe(200);
    });

    it("decreases total but not below reserved", () => {
      const stock = StockLevel.create({ ...validParams, reservedQuantity: 20 }).unwrap();
      const result = stock.adjustTotal(50, "correction");
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().total.value).toBe(50);
      expect(result.unwrap().available.value).toBe(30);
    });

    it("rejects total below reserved", () => {
      const stock = StockLevel.create({ ...validParams, reservedQuantity: 80 }).unwrap();
      const result = stock.adjustTotal(70, "correction");
      expect(result.isFail()).toBe(true);
    });

    it("rejects negative total", () => {
      const stock = StockLevel.create(validParams).unwrap();
      const result = stock.adjustTotal(-1, "bad");
      expect(result.isFail()).toBe(true);
    });
  });

  describe("reserve", () => {
    it("reserves available stock", () => {
      const stock = StockLevel.create(validParams).unwrap();
      const result = stock.reserve(30);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().reserved.value).toBe(30);
      expect(result.unwrap().available.value).toBe(70);
    });

    it("fails with InsufficientStock when exceeding available", () => {
      const stock = StockLevel.create({ ...validParams, totalQuantity: 10 }).unwrap();
      const result = stock.reserve(20);
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError().name).toBe("InsufficientStock");
    });

    it("allows partial reserve", () => {
      const stock = StockLevel.create(validParams).unwrap();
      const r1 = stock.reserve(30).unwrap();
      const r2 = r1.reserve(40);
      expect(r2.isOk()).toBe(true);
      expect(r2.unwrap().reserved.value).toBe(70);
      expect(r2.unwrap().available.value).toBe(30);
    });
  });

  describe("releaseReserved", () => {
    it("releases reserved quantity", () => {
      const stock = StockLevel.create({ ...validParams, reservedQuantity: 30 }).unwrap();
      const result = stock.releaseReserved(10);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().reserved.value).toBe(20);
      expect(result.unwrap().available.value).toBe(80);
    });

    it("fails when exceeding reserved", () => {
      const stock = StockLevel.create({ ...validParams, reservedQuantity: 10 }).unwrap();
      const result = stock.releaseReserved(20);
      expect(result.isFail()).toBe(true);
    });
  });

  describe("confirmReserved", () => {
    it("decrements both total and reserved", () => {
      const stock = StockLevel.create({ ...validParams, reservedQuantity: 30 }).unwrap();
      const result = stock.confirmReserved(10);
      expect(result.isOk()).toBe(true);
      const updated = result.unwrap();
      expect(updated.total.value).toBe(90);
      expect(updated.reserved.value).toBe(20);
      expect(updated.available.value).toBe(70);
    });

    it("fails when exceeding reserved", () => {
      const stock = StockLevel.create({ ...validParams, reservedQuantity: 10 }).unwrap();
      const result = stock.confirmReserved(20);
      expect(result.isFail()).toBe(true);
    });
  });

  describe("restock", () => {
    it("increases total", () => {
      const stock = StockLevel.create({ ...validParams, totalQuantity: 50 }).unwrap();
      const result = stock.restock(30);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().total.value).toBe(80);
      expect(result.unwrap().available.value).toBe(80);
    });

    it("rejects zero quantity", () => {
      const stock = StockLevel.create(validParams).unwrap();
      const result = stock.restock(0);
      expect(result.isFail()).toBe(true);
    });

    it("rejects negative quantity", () => {
      const stock = StockLevel.create(validParams).unwrap();
      const result = stock.restock(-5);
      expect(result.isFail()).toBe(true);
    });
  });

  describe("immutability", () => {
    it("original entity unchanged after mutations", () => {
      const original = StockLevel.create(validParams).unwrap();
      original.reserve(10);
      original.restock(50);
      original.adjustTotal(200, "test");
      expect(original.total.value).toBe(100);
      expect(original.reserved.value).toBe(0);
      expect(original.available.value).toBe(100);
    });
  });
});

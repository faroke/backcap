import { describe, it, expect, beforeEach } from "vitest";
import { AdjustStock } from "../use-cases/adjust-stock.use-case.js";
import { InMemoryStockRepository } from "./mocks/stock-repository.mock.js";
import { createTestStockLevel } from "./fixtures/stock-level.fixture.js";

describe("AdjustStock use case", () => {
  let stockRepo: InMemoryStockRepository;
  let adjustStock: AdjustStock;

  beforeEach(() => {
    stockRepo = new InMemoryStockRepository();
    adjustStock = new AdjustStock(stockRepo);
  });

  it("adjusts stock total successfully", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100 });
    await stockRepo.save(stock);

    const result = await adjustStock.execute({
      sku: "SKU-001",
      warehouseId: "warehouse-main",
      newQuantity: 50,
      reason: "correction",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.event.previousQuantity).toBe(100);
    expect(output.event.newQuantity).toBe(50);
    expect(output.event.reason).toBe("correction");
  });

  it("returns LowStockAlert when available drops at or below threshold", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100, lowStockThreshold: 10 });
    await stockRepo.save(stock);

    const result = await adjustStock.execute({
      sku: "SKU-001",
      warehouseId: "warehouse-main",
      newQuantity: 10,
      reason: "correction",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().alert).toBeDefined();
    expect(result.unwrap().alert!.available).toBe(10);
    expect(result.unwrap().alert!.threshold).toBe(10);
  });

  it("does not return LowStockAlert when available is above threshold", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100, lowStockThreshold: 10 });
    await stockRepo.save(stock);

    const result = await adjustStock.execute({
      sku: "SKU-001",
      warehouseId: "warehouse-main",
      newQuantity: 50,
      reason: "correction",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().alert).toBeUndefined();
  });

  it("fails with StockNotFound for unknown sku/warehouse", async () => {
    const result = await adjustStock.execute({
      sku: "UNKNOWN",
      warehouseId: "wh-1",
      newQuantity: 50,
      reason: "test",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("StockNotFound");
  });

  it("fails when adjusting below reserved quantity", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100, reservedQuantity: 80 });
    await stockRepo.save(stock);

    const result = await adjustStock.execute({
      sku: "SKU-001",
      warehouseId: "warehouse-main",
      newQuantity: 70,
      reason: "correction",
    });

    expect(result.isFail()).toBe(true);
  });
});

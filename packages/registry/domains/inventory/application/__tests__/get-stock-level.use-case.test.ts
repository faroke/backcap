import { describe, it, expect, beforeEach } from "vitest";
import { GetStockLevel } from "../use-cases/get-stock-level.use-case.js";
import { InMemoryStockRepository } from "./mocks/stock-repository.mock.js";
import { createTestStockLevel } from "./fixtures/stock-level.fixture.js";

describe("GetStockLevel use case", () => {
  let stockRepo: InMemoryStockRepository;
  let getStockLevel: GetStockLevel;

  beforeEach(() => {
    stockRepo = new InMemoryStockRepository();
    getStockLevel = new GetStockLevel(stockRepo);
  });

  it("returns StockLevelOutput for existing stock", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100, reservedQuantity: 20 });
    await stockRepo.save(stock);

    const result = await getStockLevel.execute("SKU-001", "warehouse-main");

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.sku).toBe("SKU-001");
    expect(output.total).toBe(100);
    expect(output.reserved).toBe(20);
    expect(output.available).toBe(80);
  });

  it("output includes computed isLowStock", async () => {
    const stock = createTestStockLevel({ totalQuantity: 10, lowStockThreshold: 10 });
    await stockRepo.save(stock);

    const result = await getStockLevel.execute("SKU-001", "warehouse-main");
    expect(result.unwrap().isLowStock).toBe(true);
  });

  it("fails with StockNotFound for unknown sku/warehouse", async () => {
    const result = await getStockLevel.execute("UNKNOWN", "wh-1");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("StockNotFound");
  });
});

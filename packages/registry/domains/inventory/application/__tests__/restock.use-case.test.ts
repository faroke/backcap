import { describe, it, expect, beforeEach } from "vitest";
import { Restock } from "../use-cases/restock.use-case.js";
import { InMemoryStockRepository } from "./mocks/stock-repository.mock.js";
import { createTestStockLevel } from "./fixtures/stock-level.fixture.js";

describe("Restock use case", () => {
  let stockRepo: InMemoryStockRepository;
  let restock: Restock;

  beforeEach(() => {
    stockRepo = new InMemoryStockRepository();
    restock = new Restock(stockRepo);
  });

  it("restocks successfully", async () => {
    const stock = createTestStockLevel({ totalQuantity: 50 });
    await stockRepo.save(stock);

    const result = await restock.execute({
      sku: "SKU-001",
      warehouseId: "warehouse-main",
      quantity: 30,
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.event.addedQuantity).toBe(30);
    expect(output.event.newTotal).toBe(80);
  });

  it("increments stock total in repository", async () => {
    const stock = createTestStockLevel({ totalQuantity: 50 });
    await stockRepo.save(stock);

    await restock.execute({
      sku: "SKU-001",
      warehouseId: "warehouse-main",
      quantity: 30,
    });

    const updated = await stockRepo.findBySkuAndWarehouse("SKU-001", "warehouse-main");
    expect(updated!.total.value).toBe(80);
  });

  it("fails with StockNotFound for unknown sku/warehouse", async () => {
    const result = await restock.execute({
      sku: "UNKNOWN",
      warehouseId: "wh-1",
      quantity: 10,
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("StockNotFound");
  });

  it("fails with invalid quantity (zero)", async () => {
    const stock = createTestStockLevel();
    await stockRepo.save(stock);

    const result = await restock.execute({
      sku: "SKU-001",
      warehouseId: "warehouse-main",
      quantity: 0,
    });

    expect(result.isFail()).toBe(true);
  });

  it("fails with invalid quantity (negative)", async () => {
    const stock = createTestStockLevel();
    await stockRepo.save(stock);

    const result = await restock.execute({
      sku: "SKU-001",
      warehouseId: "warehouse-main",
      quantity: -5,
    });

    expect(result.isFail()).toBe(true);
  });
});

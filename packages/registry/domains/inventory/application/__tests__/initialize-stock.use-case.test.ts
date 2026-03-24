import { describe, it, expect, beforeEach } from "vitest";
import { InitializeStock } from "../use-cases/initialize-stock.use-case.js";
import { InMemoryStockRepository } from "./mocks/stock-repository.mock.js";

describe("InitializeStock use case", () => {
  let stockRepo: InMemoryStockRepository;
  let initializeStock: InitializeStock;

  beforeEach(() => {
    stockRepo = new InMemoryStockRepository();
    initializeStock = new InitializeStock(stockRepo);
  });

  it("initializes stock successfully", async () => {
    const result = await initializeStock.execute({
      sku: "SKU-001",
      warehouseId: "wh-1",
      quantity: 100,
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.stockLevelId).toBeDefined();
    expect(output.event.sku).toBe("SKU-001");
    expect(output.event.warehouseId).toBe("wh-1");
    expect(output.event.quantity).toBe(100);
  });

  it("saves entity with correct values", async () => {
    const result = await initializeStock.execute({
      sku: "SKU-001",
      warehouseId: "wh-1",
      quantity: 50,
      lowStockThreshold: 5,
    });

    const saved = await stockRepo.findById(result.unwrap().stockLevelId);
    expect(saved).not.toBeNull();
    expect(saved!.sku).toBe("SKU-001");
    expect(saved!.warehouseId.value).toBe("wh-1");
    expect(saved!.total.value).toBe(50);
    expect(saved!.lowStockThreshold).toBe(5);
  });

  it("fails if stock already exists for (sku, warehouseId)", async () => {
    await initializeStock.execute({ sku: "SKU-001", warehouseId: "wh-1", quantity: 100 });
    const result = await initializeStock.execute({ sku: "SKU-001", warehouseId: "wh-1", quantity: 50 });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("already exists");
  });

  it("fails with invalid quantity", async () => {
    const result = await initializeStock.execute({
      sku: "SKU-001",
      warehouseId: "wh-1",
      quantity: -10,
    });

    expect(result.isFail()).toBe(true);
  });
});

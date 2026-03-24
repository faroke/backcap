import { describe, it, expect, beforeEach } from "vitest";
import { CheckAvailability } from "../use-cases/check-availability.use-case.js";
import { InMemoryStockRepository } from "./mocks/stock-repository.mock.js";
import { createTestStockLevel } from "./fixtures/stock-level.fixture.js";

describe("CheckAvailability use case", () => {
  let stockRepo: InMemoryStockRepository;
  let checkAvailability: CheckAvailability;

  beforeEach(() => {
    stockRepo = new InMemoryStockRepository();
    checkAvailability = new CheckAvailability(stockRepo);
  });

  it("returns all stock levels across warehouses for a SKU", async () => {
    const stock1 = createTestStockLevel({ id: "s-1", warehouseId: "wh-1", totalQuantity: 50 });
    const stock2 = createTestStockLevel({ id: "s-2", warehouseId: "wh-2", totalQuantity: 30 });
    await stockRepo.save(stock1);
    await stockRepo.save(stock2);

    const result = await checkAvailability.execute("SKU-001");

    expect(result.isOk()).toBe(true);
    const outputs = result.unwrap();
    expect(outputs).toHaveLength(2);
    expect(outputs.map((o) => o.warehouseId).sort()).toEqual(["wh-1", "wh-2"]);
  });

  it("returns empty array for unknown SKU", async () => {
    const result = await checkAvailability.execute("UNKNOWN");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toHaveLength(0);
  });

  it("each output has correct computed fields", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100, reservedQuantity: 30, lowStockThreshold: 10 });
    await stockRepo.save(stock);

    const result = await checkAvailability.execute("SKU-001");
    const output = result.unwrap()[0];
    expect(output.available).toBe(70);
    expect(output.isLowStock).toBe(false);
  });
});

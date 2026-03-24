import { describe, it, expect, beforeEach } from "vitest";
import { ReserveStock } from "../use-cases/reserve-stock.use-case.js";
import { InMemoryStockRepository } from "./mocks/stock-repository.mock.js";
import { InMemoryReservationRepository } from "./mocks/reservation-repository.mock.js";
import { createTestStockLevel } from "./fixtures/stock-level.fixture.js";

describe("ReserveStock use case", () => {
  let stockRepo: InMemoryStockRepository;
  let reservationRepo: InMemoryReservationRepository;
  let reserveStock: ReserveStock;

  beforeEach(() => {
    stockRepo = new InMemoryStockRepository();
    reservationRepo = new InMemoryReservationRepository();
    reserveStock = new ReserveStock(stockRepo, reservationRepo);
  });

  it("reserves stock successfully", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100 });
    await stockRepo.save(stock);

    const result = await reserveStock.execute({
      sku: "SKU-001",
      warehouseId: "warehouse-main",
      quantity: 10,
      referenceId: "order-1",
      referenceType: "order",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.reservationId).toBeDefined();
    expect(output.event.quantity).toBe(10);
  });

  it("updates stock reserved quantity in repository", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100 });
    await stockRepo.save(stock);

    await reserveStock.execute({
      sku: "SKU-001",
      warehouseId: "warehouse-main",
      quantity: 10,
      referenceId: "order-1",
      referenceType: "order",
    });

    const updated = await stockRepo.findBySkuAndWarehouse("SKU-001", "warehouse-main");
    expect(updated!.reserved.value).toBe(10);
    expect(updated!.available.value).toBe(90);
  });

  it("creates reservation with correct fields and expiry", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100 });
    await stockRepo.save(stock);

    const before = Date.now();
    const result = await reserveStock.execute({
      sku: "SKU-001",
      warehouseId: "warehouse-main",
      quantity: 10,
      referenceId: "order-1",
      referenceType: "order",
      expiresInMinutes: 60,
    });

    const reservation = await reservationRepo.findById(result.unwrap().reservationId);
    expect(reservation).not.toBeNull();
    expect(reservation!.sku).toBe("SKU-001");
    expect(reservation!.referenceId).toBe("order-1");
    expect(reservation!.referenceType).toBe("order");
    expect(reservation!.expiresAt.getTime()).toBeGreaterThanOrEqual(before + 59 * 60 * 1000);
  });

  it("fails with InsufficientStock when quantity exceeds available", async () => {
    const stock = createTestStockLevel({ totalQuantity: 5 });
    await stockRepo.save(stock);

    const result = await reserveStock.execute({
      sku: "SKU-001",
      warehouseId: "warehouse-main",
      quantity: 10,
      referenceId: "order-1",
      referenceType: "order",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InsufficientStock");
  });

  it("fails with StockNotFound for unknown sku/warehouse", async () => {
    const result = await reserveStock.execute({
      sku: "UNKNOWN",
      warehouseId: "wh-1",
      quantity: 10,
      referenceId: "order-1",
      referenceType: "order",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("StockNotFound");
  });

  it("returns LowStockAlert when reserve causes low stock", async () => {
    const stock = createTestStockLevel({ totalQuantity: 15, lowStockThreshold: 10 });
    await stockRepo.save(stock);

    const result = await reserveStock.execute({
      sku: "SKU-001",
      warehouseId: "warehouse-main",
      quantity: 10,
      referenceId: "order-1",
      referenceType: "order",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().alert).toBeDefined();
    expect(result.unwrap().alert!.available).toBe(5);
  });

  it("does not return LowStockAlert when available remains above threshold", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100, lowStockThreshold: 10 });
    await stockRepo.save(stock);

    const result = await reserveStock.execute({
      sku: "SKU-001",
      warehouseId: "warehouse-main",
      quantity: 5,
      referenceId: "order-1",
      referenceType: "order",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().alert).toBeUndefined();
  });

  it("creates reservation with ~30-minute default expiry", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100 });
    await stockRepo.save(stock);

    const before = Date.now();
    const result = await reserveStock.execute({
      sku: "SKU-001",
      warehouseId: "warehouse-main",
      quantity: 5,
      referenceId: "order-1",
      referenceType: "order",
    });

    const reservation = await reservationRepo.findById(result.unwrap().reservationId);
    const expectedMin = before + 29 * 60 * 1000;
    const expectedMax = before + 31 * 60 * 1000;
    expect(reservation!.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin);
    expect(reservation!.expiresAt.getTime()).toBeLessThanOrEqual(expectedMax);
  });
});

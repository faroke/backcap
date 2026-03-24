import { describe, it, expect, beforeEach } from "vitest";
import { createInventoryService } from "../inventory.factory.js";
import { InMemoryStockRepository } from "../../application/__tests__/mocks/stock-repository.mock.js";
import { InMemoryReservationRepository } from "../../application/__tests__/mocks/reservation-repository.mock.js";
import type { IInventoryService } from "../inventory.contract.js";

describe("createInventoryService (factory)", () => {
  let service: IInventoryService;
  let stockRepo: InMemoryStockRepository;
  let reservationRepo: InMemoryReservationRepository;

  beforeEach(() => {
    stockRepo = new InMemoryStockRepository();
    reservationRepo = new InMemoryReservationRepository();
    service = createInventoryService({ stockRepository: stockRepo, reservationRepository: reservationRepo });
  });

  it("initializeStock returns stockLevelId", async () => {
    const result = await service.initializeStock({
      sku: "SKU-001",
      warehouseId: "wh-1",
      quantity: 100,
    });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().stockLevelId).toBeDefined();
  });

  it("adjustStock returns void on success", async () => {
    await service.initializeStock({ sku: "SKU-001", warehouseId: "wh-1", quantity: 100 });
    const result = await service.adjustStock({
      sku: "SKU-001",
      warehouseId: "wh-1",
      newQuantity: 50,
      reason: "correction",
    });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBeUndefined();
  });

  it("reserveStock returns reservationId", async () => {
    await service.initializeStock({ sku: "SKU-001", warehouseId: "wh-1", quantity: 100 });
    const result = await service.reserveStock({
      sku: "SKU-001",
      warehouseId: "wh-1",
      quantity: 10,
      referenceId: "order-1",
      referenceType: "order",
    });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().reservationId).toBeDefined();
  });

  it("releaseReservation returns void on success", async () => {
    await service.initializeStock({ sku: "SKU-001", warehouseId: "wh-1", quantity: 100 });
    const reserved = await service.reserveStock({
      sku: "SKU-001",
      warehouseId: "wh-1",
      quantity: 10,
      referenceId: "order-1",
      referenceType: "order",
    });
    const result = await service.releaseReservation(reserved.unwrap().reservationId);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBeUndefined();
  });

  it("confirmReservation returns void on success", async () => {
    await service.initializeStock({ sku: "SKU-001", warehouseId: "wh-1", quantity: 100 });
    const reserved = await service.reserveStock({
      sku: "SKU-001",
      warehouseId: "wh-1",
      quantity: 10,
      referenceId: "order-1",
      referenceType: "order",
    });
    const result = await service.confirmReservation(reserved.unwrap().reservationId);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBeUndefined();
  });

  it("restock returns newTotal", async () => {
    await service.initializeStock({ sku: "SKU-001", warehouseId: "wh-1", quantity: 50 });
    const result = await service.restock({ sku: "SKU-001", warehouseId: "wh-1", quantity: 30 });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().newTotal).toBe(80);
  });

  it("getStockLevel returns StockLevelOutput", async () => {
    await service.initializeStock({ sku: "SKU-001", warehouseId: "wh-1", quantity: 100 });
    const result = await service.getStockLevel("SKU-001", "wh-1");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().total).toBe(100);
    expect(result.unwrap().available).toBe(100);
  });

  it("checkAvailability returns array of StockLevelOutput", async () => {
    await service.initializeStock({ sku: "SKU-001", warehouseId: "wh-1", quantity: 50 });
    await service.initializeStock({ sku: "SKU-001", warehouseId: "wh-2", quantity: 30 });
    const result = await service.checkAvailability("SKU-001");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toHaveLength(2);
  });

  it("propagates errors correctly", async () => {
    const result = await service.getStockLevel("UNKNOWN", "wh-1");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("StockNotFound");
  });
});

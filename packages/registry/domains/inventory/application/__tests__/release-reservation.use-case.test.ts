import { describe, it, expect, beforeEach } from "vitest";
import { ReleaseReservation } from "../use-cases/release-reservation.use-case.js";
import { InMemoryStockRepository } from "./mocks/stock-repository.mock.js";
import { InMemoryReservationRepository } from "./mocks/reservation-repository.mock.js";
import { createTestStockLevel } from "./fixtures/stock-level.fixture.js";
import { createTestReservation } from "./fixtures/reservation.fixture.js";

describe("ReleaseReservation use case", () => {
  let stockRepo: InMemoryStockRepository;
  let reservationRepo: InMemoryReservationRepository;
  let releaseReservation: ReleaseReservation;

  beforeEach(() => {
    stockRepo = new InMemoryStockRepository();
    reservationRepo = new InMemoryReservationRepository();
    releaseReservation = new ReleaseReservation(stockRepo, reservationRepo);
  });

  it("releases reservation successfully", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100, reservedQuantity: 5 });
    const reservation = createTestReservation({ quantity: 5 });
    await stockRepo.save(stock);
    await reservationRepo.save(reservation);

    const result = await releaseReservation.execute("res-1");

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().event.reservationId).toBe("res-1");
    expect(result.unwrap().event.quantity).toBe(5);
  });

  it("decrements stock reserved quantity", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100, reservedQuantity: 5 });
    const reservation = createTestReservation({ quantity: 5 });
    await stockRepo.save(stock);
    await reservationRepo.save(reservation);

    await releaseReservation.execute("res-1");

    const updated = await stockRepo.findBySkuAndWarehouse("SKU-001", "warehouse-main");
    expect(updated!.reserved.value).toBe(0);
    expect(updated!.available.value).toBe(100);
  });

  it("updates reservation status to released", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100, reservedQuantity: 5 });
    const reservation = createTestReservation({ quantity: 5 });
    await stockRepo.save(stock);
    await reservationRepo.save(reservation);

    await releaseReservation.execute("res-1");

    const updated = await reservationRepo.findById("res-1");
    expect(updated!.status.isReleased()).toBe(true);
  });

  it("fails with ReservationNotFound for unknown ID", async () => {
    const result = await releaseReservation.execute("unknown");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("ReservationNotFound");
  });

  it("succeeds even if reservation is expired", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100, reservedQuantity: 5 });
    const expiredReservation = createTestReservation({
      quantity: 5,
      expiresAt: new Date(Date.now() - 60 * 1000),
      status: "pending",
    });
    await stockRepo.save(stock);
    await reservationRepo.save(expiredReservation);

    const result = await releaseReservation.execute("res-1");
    expect(result.isOk()).toBe(true);
  });

  it("is idempotent for already-released reservation", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100, reservedQuantity: 5 });
    const reservation = createTestReservation({ quantity: 5 });
    await stockRepo.save(stock);
    await reservationRepo.save(reservation);

    await releaseReservation.execute("res-1");
    const stockAfterFirst = await stockRepo.findBySkuAndWarehouse("SKU-001", "warehouse-main");
    const reservedAfterFirst = stockAfterFirst!.reserved.value;

    // Second release should be a no-op
    const result = await releaseReservation.execute("res-1");
    expect(result.isOk()).toBe(true);

    const stockAfterSecond = await stockRepo.findBySkuAndWarehouse("SKU-001", "warehouse-main");
    expect(stockAfterSecond!.reserved.value).toBe(reservedAfterFirst);
  });
});

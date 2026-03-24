import { describe, it, expect, beforeEach } from "vitest";
import { ConfirmReservation } from "../use-cases/confirm-reservation.use-case.js";
import { InMemoryStockRepository } from "./mocks/stock-repository.mock.js";
import { InMemoryReservationRepository } from "./mocks/reservation-repository.mock.js";
import { createTestStockLevel } from "./fixtures/stock-level.fixture.js";
import { createTestReservation } from "./fixtures/reservation.fixture.js";

describe("ConfirmReservation use case", () => {
  let stockRepo: InMemoryStockRepository;
  let reservationRepo: InMemoryReservationRepository;
  let confirmReservation: ConfirmReservation;

  beforeEach(() => {
    stockRepo = new InMemoryStockRepository();
    reservationRepo = new InMemoryReservationRepository();
    confirmReservation = new ConfirmReservation(stockRepo, reservationRepo);
  });

  it("confirms reservation successfully", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100, reservedQuantity: 10 });
    const reservation = createTestReservation({ quantity: 10 });
    await stockRepo.save(stock);
    await reservationRepo.save(reservation);

    const result = await confirmReservation.execute("res-1");

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().event.reservationId).toBe("res-1");
    expect(result.unwrap().event.quantity).toBe(10);
  });

  it("decrements stock total and reserved", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100, reservedQuantity: 10 });
    const reservation = createTestReservation({ quantity: 10 });
    await stockRepo.save(stock);
    await reservationRepo.save(reservation);

    await confirmReservation.execute("res-1");

    const updated = await stockRepo.findBySkuAndWarehouse("SKU-001", "warehouse-main");
    expect(updated!.total.value).toBe(90);
    expect(updated!.reserved.value).toBe(0);
  });

  it("updates reservation status to confirmed", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100, reservedQuantity: 10 });
    const reservation = createTestReservation({ quantity: 10 });
    await stockRepo.save(stock);
    await reservationRepo.save(reservation);

    await confirmReservation.execute("res-1");

    const updated = await reservationRepo.findById("res-1");
    expect(updated!.status.isConfirmed()).toBe(true);
  });

  it("fails with ReservationNotFound for unknown ID", async () => {
    const result = await confirmReservation.execute("unknown");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("ReservationNotFound");
  });

  it("fails with ReservationExpired if reservation is past expiry", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100, reservedQuantity: 5 });
    const expiredReservation = createTestReservation({
      quantity: 5,
      expiresAt: new Date(Date.now() - 60 * 1000),
      status: "pending",
    });
    await stockRepo.save(stock);
    await reservationRepo.save(expiredReservation);

    const result = await confirmReservation.execute("res-1");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("ReservationExpired");
  });

  it("is idempotent for already-confirmed reservation", async () => {
    const stock = createTestStockLevel({ totalQuantity: 100, reservedQuantity: 10 });
    const reservation = createTestReservation({ quantity: 10 });
    await stockRepo.save(stock);
    await reservationRepo.save(reservation);

    await confirmReservation.execute("res-1");
    const stockAfterFirst = await stockRepo.findBySkuAndWarehouse("SKU-001", "warehouse-main");
    const totalAfterFirst = stockAfterFirst!.total.value;

    // Second confirm should be a no-op
    const result = await confirmReservation.execute("res-1");
    expect(result.isOk()).toBe(true);

    const stockAfterSecond = await stockRepo.findBySkuAndWarehouse("SKU-001", "warehouse-main");
    expect(stockAfterSecond!.total.value).toBe(totalAfterFirst);
  });
});

import { Result } from "../../shared/result.js";
import { ReservationNotFound } from "../../domain/errors/reservation-not-found.error.js";
import { StockNotFound } from "../../domain/errors/stock-not-found.error.js";
import { ReservationReleased } from "../../domain/events/reservation-released.event.js";
import type { InvalidReservationState } from "../../domain/errors/invalid-reservation-state.error.js";
import type { InvalidStockQuantity } from "../../domain/errors/invalid-stock-quantity.error.js";
import type { IStockRepository } from "../ports/stock-repository.port.js";
import type { IReservationRepository } from "../ports/reservation-repository.port.js";

export class ReleaseReservation {
  constructor(
    private readonly stockRepository: IStockRepository,
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(
    reservationId: string,
  ): Promise<
    Result<
      { event: ReservationReleased },
      ReservationNotFound | InvalidReservationState | StockNotFound | InvalidStockQuantity
    >
  > {
    const reservation = await this.reservationRepository.findById(reservationId);
    if (!reservation) {
      return Result.fail(ReservationNotFound.create(reservationId));
    }

    // Idempotent: already released — return ok without event or stock changes
    if (reservation.status.isReleased()) {
      const event = new ReservationReleased(
        reservation.id,
        reservation.sku,
        reservation.warehouseId.value,
        reservation.quantity.value,
      );
      return Result.ok({ event });
    }

    const releaseResult = reservation.release(new Date());
    if (releaseResult.isFail()) {
      return Result.fail(releaseResult.unwrapError());
    }

    const updatedReservation = releaseResult.unwrap();

    const stock = await this.stockRepository.findBySkuAndWarehouse(
      reservation.sku,
      reservation.warehouseId.value,
    );
    if (!stock) {
      return Result.fail(StockNotFound.create(reservation.sku, reservation.warehouseId.value));
    }

    const releaseStockResult = stock.releaseReserved(reservation.quantity.value);
    if (releaseStockResult.isFail()) {
      return Result.fail(releaseStockResult.unwrapError());
    }

    await this.stockRepository.update(releaseStockResult.unwrap());
    await this.reservationRepository.update(updatedReservation);

    const event = new ReservationReleased(
      reservation.id,
      reservation.sku,
      reservation.warehouseId.value,
      reservation.quantity.value,
    );

    return Result.ok({ event });
  }
}

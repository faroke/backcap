import { Result } from "../../shared/result.js";
import { ReservationNotFound } from "../../domain/errors/reservation-not-found.error.js";
import { StockNotFound } from "../../domain/errors/stock-not-found.error.js";
import { ReservationConfirmed } from "../../domain/events/reservation-confirmed.event.js";
import type { ReservationExpired } from "../../domain/errors/reservation-expired.error.js";
import type { InvalidReservationState } from "../../domain/errors/invalid-reservation-state.error.js";
import type { InvalidStockQuantity } from "../../domain/errors/invalid-stock-quantity.error.js";
import type { IStockRepository } from "../ports/stock-repository.port.js";
import type { IReservationRepository } from "../ports/reservation-repository.port.js";

export class ConfirmReservation {
  constructor(
    private readonly stockRepository: IStockRepository,
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(
    reservationId: string,
  ): Promise<
    Result<
      { event: ReservationConfirmed },
      ReservationNotFound | InvalidReservationState | ReservationExpired | StockNotFound | InvalidStockQuantity
    >
  > {
    const reservation = await this.reservationRepository.findById(reservationId);
    if (!reservation) {
      return Result.fail(ReservationNotFound.create(reservationId));
    }

    // Idempotent: already confirmed — return ok without event or stock changes
    if (reservation.status.isConfirmed()) {
      const event = new ReservationConfirmed(
        reservation.id,
        reservation.sku,
        reservation.warehouseId.value,
        reservation.quantity.value,
      );
      return Result.ok({ event });
    }

    const confirmResult = reservation.confirm(new Date());
    if (confirmResult.isFail()) {
      return Result.fail(confirmResult.unwrapError());
    }

    const updatedReservation = confirmResult.unwrap();

    const stock = await this.stockRepository.findBySkuAndWarehouse(
      reservation.sku,
      reservation.warehouseId.value,
    );
    if (!stock) {
      return Result.fail(StockNotFound.create(reservation.sku, reservation.warehouseId.value));
    }

    const confirmStockResult = stock.confirmReserved(reservation.quantity.value);
    if (confirmStockResult.isFail()) {
      return Result.fail(confirmStockResult.unwrapError());
    }

    await this.stockRepository.update(confirmStockResult.unwrap());
    await this.reservationRepository.update(updatedReservation);

    const event = new ReservationConfirmed(
      reservation.id,
      reservation.sku,
      reservation.warehouseId.value,
      reservation.quantity.value,
    );

    return Result.ok({ event });
  }
}

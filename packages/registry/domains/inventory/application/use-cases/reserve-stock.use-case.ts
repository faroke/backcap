import { Result } from "../../shared/result.js";
import { Reservation } from "../../domain/entities/reservation.entity.js";
import { StockNotFound } from "../../domain/errors/stock-not-found.error.js";
import { StockReserved } from "../../domain/events/stock-reserved.event.js";
import { LowStockAlert } from "../../domain/events/low-stock-alert.event.js";
import type { InsufficientStock } from "../../domain/errors/insufficient-stock.error.js";
import type { InvalidStockQuantity } from "../../domain/errors/invalid-stock-quantity.error.js";
import type { InvalidSku } from "../../domain/errors/invalid-sku.error.js";
import type { InvalidReservationReference } from "../../domain/errors/invalid-reservation-reference.error.js";
import type { InvalidWarehouseId } from "../../domain/errors/invalid-warehouse-id.error.js";
import type { InvalidReservationStatus } from "../../domain/errors/invalid-reservation-status.error.js";
import type { InvalidReservationExpiry } from "../../domain/errors/invalid-reservation-expiry.error.js";
import type { IStockRepository } from "../ports/stock-repository.port.js";
import type { IReservationRepository } from "../ports/reservation-repository.port.js";
import type { ReserveStockInput } from "../dto/reserve-stock-input.dto.js";

export class ReserveStock {
  constructor(
    private readonly stockRepository: IStockRepository,
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(
    input: ReserveStockInput,
  ): Promise<
    Result<
      { reservationId: string; event: StockReserved; alert?: LowStockAlert | undefined },
      | StockNotFound
      | InsufficientStock
      | InvalidStockQuantity
      | InvalidSku
      | InvalidReservationReference
      | InvalidWarehouseId
      | InvalidReservationStatus
      | InvalidReservationExpiry
    >
  > {
    const stock = await this.stockRepository.findBySkuAndWarehouse(input.sku, input.warehouseId);
    if (!stock) {
      return Result.fail(StockNotFound.create(input.sku, input.warehouseId));
    }

    const reserveResult = stock.reserve(input.quantity);
    if (reserveResult.isFail()) {
      return Result.fail(reserveResult.unwrapError());
    }

    const updatedStock = reserveResult.unwrap();
    const expiresInMinutes = input.expiresInMinutes ?? 30;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    const reservationId = crypto.randomUUID();
    const reservationResult = Reservation.create({
      id: reservationId,
      sku: input.sku,
      warehouseId: input.warehouseId,
      quantity: input.quantity,
      referenceId: input.referenceId,
      referenceType: input.referenceType,
      expiresAt,
    });

    if (reservationResult.isFail()) {
      return Result.fail(reservationResult.unwrapError());
    }

    await this.stockRepository.update(updatedStock);
    await this.reservationRepository.save(reservationResult.unwrap());

    const event = new StockReserved(
      reservationId,
      updatedStock.sku,
      updatedStock.warehouseId.value,
      input.quantity,
    );

    const alert = updatedStock.isLowStock
      ? new LowStockAlert(
          updatedStock.sku,
          updatedStock.warehouseId.value,
          updatedStock.available.value,
          updatedStock.lowStockThreshold,
        )
      : undefined;

    return Result.ok({ reservationId, event, alert });
  }
}

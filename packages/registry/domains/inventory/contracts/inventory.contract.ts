import type { Result } from "../shared/result.js";
import type { StockLevelOutput } from "../application/dto/stock-level-output.dto.js";
import type { ReservationOutput } from "../application/dto/reservation-output.dto.js";
import type { StockNotFound } from "../domain/errors/stock-not-found.error.js";
import type { StockAlreadyExists } from "../domain/errors/stock-already-exists.error.js";
import type { ReservationNotFound } from "../domain/errors/reservation-not-found.error.js";
import type { ReservationExpired } from "../domain/errors/reservation-expired.error.js";
import type { InsufficientStock } from "../domain/errors/insufficient-stock.error.js";
import type { InvalidStockQuantity } from "../domain/errors/invalid-stock-quantity.error.js";
import type { InvalidSku } from "../domain/errors/invalid-sku.error.js";
import type { InvalidWarehouseId } from "../domain/errors/invalid-warehouse-id.error.js";
import type { InvalidReservationReference } from "../domain/errors/invalid-reservation-reference.error.js";
import type { InvalidReservationStatus } from "../domain/errors/invalid-reservation-status.error.js";
import type { InvalidReservationExpiry } from "../domain/errors/invalid-reservation-expiry.error.js";
import type { InvalidReservationState } from "../domain/errors/invalid-reservation-state.error.js";

export interface InventoryInitializeStockInput {
  sku: string;
  warehouseId: string;
  quantity: number;
  lowStockThreshold?: number;
}

export interface InventoryAdjustStockInput {
  sku: string;
  warehouseId: string;
  newQuantity: number;
  reason: string;
}

export interface InventoryReserveStockInput {
  sku: string;
  warehouseId: string;
  quantity: number;
  referenceId: string;
  referenceType: string;
  expiresInMinutes?: number;
}

export interface InventoryRestockInput {
  sku: string;
  warehouseId: string;
  quantity: number;
}

export interface IInventoryService {
  initializeStock(
    input: InventoryInitializeStockInput,
  ): Promise<
    Result<
      { stockLevelId: string },
      StockAlreadyExists | InvalidSku | InvalidWarehouseId | InvalidStockQuantity
    >
  >;
  adjustStock(
    input: InventoryAdjustStockInput,
  ): Promise<Result<void, StockNotFound | InvalidStockQuantity>>;
  reserveStock(
    input: InventoryReserveStockInput,
  ): Promise<
    Result<
      { reservationId: string },
      | StockNotFound
      | InsufficientStock
      | InvalidStockQuantity
      | InvalidSku
      | InvalidReservationReference
      | InvalidWarehouseId
      | InvalidReservationStatus
      | InvalidReservationExpiry
    >
  >;
  releaseReservation(
    reservationId: string,
  ): Promise<
    Result<void, ReservationNotFound | InvalidReservationState | StockNotFound | InvalidStockQuantity>
  >;
  confirmReservation(
    reservationId: string,
  ): Promise<
    Result<
      void,
      ReservationNotFound | InvalidReservationState | ReservationExpired | StockNotFound | InvalidStockQuantity
    >
  >;
  restock(
    input: InventoryRestockInput,
  ): Promise<Result<{ newTotal: number }, StockNotFound | InvalidStockQuantity>>;
  getStockLevel(sku: string, warehouseId: string): Promise<Result<StockLevelOutput, StockNotFound>>;
  checkAvailability(sku: string): Promise<Result<StockLevelOutput[], never>>;
}

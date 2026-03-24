import type { Result } from "../shared/result.js";
import type { StockLevelOutput } from "../application/dto/stock-level-output.dto.js";
import type { ReservationOutput } from "../application/dto/reservation-output.dto.js";

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
  initializeStock(input: InventoryInitializeStockInput): Promise<Result<{ stockLevelId: string }, Error>>;
  adjustStock(input: InventoryAdjustStockInput): Promise<Result<void, Error>>;
  reserveStock(input: InventoryReserveStockInput): Promise<Result<{ reservationId: string }, Error>>;
  releaseReservation(reservationId: string): Promise<Result<void, Error>>;
  confirmReservation(reservationId: string): Promise<Result<void, Error>>;
  restock(input: InventoryRestockInput): Promise<Result<{ newTotal: number }, Error>>;
  getStockLevel(sku: string, warehouseId: string): Promise<Result<StockLevelOutput, Error>>;
  checkAvailability(sku: string): Promise<Result<StockLevelOutput[], Error>>;
}

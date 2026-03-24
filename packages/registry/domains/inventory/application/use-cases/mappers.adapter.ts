import type { StockLevel } from "../../domain/entities/stock-level.entity.js";
import type { Reservation } from "../../domain/entities/reservation.entity.js";
import type { StockLevelOutput } from "../dto/stock-level-output.dto.js";
import type { ReservationOutput } from "../dto/reservation-output.dto.js";

export function toStockLevelOutput(stock: StockLevel): StockLevelOutput {
  return {
    id: stock.id,
    sku: stock.sku,
    warehouseId: stock.warehouseId.value,
    total: stock.total.value,
    reserved: stock.reserved.value,
    available: stock.available.value,
    lowStockThreshold: stock.lowStockThreshold,
    isLowStock: stock.isLowStock,
    createdAt: stock.createdAt,
    updatedAt: stock.updatedAt,
  };
}

export function toReservationOutput(reservation: Reservation, now: Date = new Date()): ReservationOutput {
  return {
    id: reservation.id,
    sku: reservation.sku,
    warehouseId: reservation.warehouseId.value,
    quantity: reservation.quantity.value,
    status: reservation.status.value,
    referenceId: reservation.referenceId,
    referenceType: reservation.referenceType,
    expiresAt: reservation.expiresAt,
    isExpired: reservation.isExpired(now),
    createdAt: reservation.createdAt,
    updatedAt: reservation.updatedAt,
  };
}

import type { StockLevel } from "../../domain/entities/stock-level.entity.js";

/**
 * Implementations MUST enforce a unique constraint on (sku, warehouseId).
 * The InitializeStock use-case performs a pre-check via findBySkuAndWarehouse(),
 * but this is not sufficient for concurrent writes. The persistence layer
 * must reject duplicate (sku, warehouseId) pairs at the database level.
 *
 * Several use-cases (ReserveStock, ReleaseReservation, ConfirmReservation)
 * update both a StockLevel and a Reservation in separate repository calls.
 * Implementations SHOULD wrap these operations in a transaction or unit-of-work
 * to guarantee atomicity. Without transactional boundaries, a crash between
 * the two writes can leave stock and reservations in an inconsistent state.
 */
export interface IStockRepository {
  findById(id: string): Promise<StockLevel | null>;
  findBySkuAndWarehouse(sku: string, warehouseId: string): Promise<StockLevel | null>;
  findBySku(sku: string): Promise<StockLevel[]>;
  save(stockLevel: StockLevel): Promise<void>;
  update(stockLevel: StockLevel): Promise<void>;
}

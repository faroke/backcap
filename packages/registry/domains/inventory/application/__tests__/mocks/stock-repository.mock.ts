import type { StockLevel } from "../../../domain/entities/stock-level.entity.js";
import type { IStockRepository } from "../../ports/stock-repository.port.js";

export class InMemoryStockRepository implements IStockRepository {
  private store = new Map<string, StockLevel>();

  async findById(id: string): Promise<StockLevel | null> {
    return this.store.get(id) ?? null;
  }

  async findBySkuAndWarehouse(sku: string, warehouseId: string): Promise<StockLevel | null> {
    for (const stock of this.store.values()) {
      if (stock.sku === sku && stock.warehouseId.value === warehouseId) {
        return stock;
      }
    }
    return null;
  }

  async findBySku(sku: string): Promise<StockLevel[]> {
    return [...this.store.values()].filter((s) => s.sku === sku);
  }

  async save(stockLevel: StockLevel): Promise<void> {
    this.store.set(stockLevel.id, stockLevel);
  }

  async update(stockLevel: StockLevel): Promise<void> {
    this.store.set(stockLevel.id, stockLevel);
  }
}

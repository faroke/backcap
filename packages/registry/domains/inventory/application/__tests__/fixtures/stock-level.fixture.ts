import { StockLevel } from "../../../domain/entities/stock-level.entity.js";

export function createTestStockLevel(
  overrides?: Partial<{
    id: string;
    sku: string;
    warehouseId: string;
    totalQuantity: number;
    reservedQuantity: number;
    lowStockThreshold: number;
    createdAt: Date;
    updatedAt: Date;
  }>,
): StockLevel {
  const result = StockLevel.create({
    id: overrides?.id ?? "stock-1",
    sku: overrides?.sku ?? "SKU-001",
    warehouseId: overrides?.warehouseId ?? "warehouse-main",
    totalQuantity: overrides?.totalQuantity ?? 100,
    reservedQuantity: overrides?.reservedQuantity ?? 0,
    lowStockThreshold: overrides?.lowStockThreshold ?? 10,
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test stock level: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
